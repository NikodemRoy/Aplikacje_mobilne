import { initializeApp } from '@firebase/app';
import {
  collection,
  doc,
  FirestoreError,
  getDoc,
  getDocs,
  getFirestore,
  QuerySnapshot,
  setDoc,
  Timestamp
} from '@firebase/firestore';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser, getAuth, signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type UserProfile = {
  firstName: string;
  lastName: string;
  project: 'Retail' | 'E-commerce' | 'Customer support' | 'Ekspert';
};

export type User = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  project?: string;
};

export type DailyReport = {
  date: string;         
  activity: string;     
  startTime?: string;   
  endTime?: string;      
  totalHours?: number;   
  createdAt: Timestamp;
};

export const getUserProfile = async (userUid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userUid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error fetching user profile:', (e as FirestoreError).message);
    return null;
  }
};

export const saveUserProfile = async (
  userUid: string,
  profile: UserProfile
): Promise<void> => {
  const docRef = doc(db, 'users', userUid);
  await setDoc(docRef, profile);
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const res = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await getUserProfile(res.user.uid);
    
    return {
      uid: res.user.uid,
      email: res.user.email || '',
      ...profile,
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const registerUser = async (email: string, password: string): Promise<boolean> => {
  try {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
  const profile = await getUserProfile(firebaseUser.uid);
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    ...profile,
  };
};

const FORCED_EIGHT = new Set<string>([
  'Delegacja',
  'Zwolnienie chorobowe',
  'Odbiór dnia wolnego',
  'Urlop płatny',
]);

export const getReportForDate = async (
  userUid: string,
  date: string
): Promise<DailyReport | null> => {
  const docRef = doc(db, 'reports', userUid, 'daily', date);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as DailyReport) : null;
};

export const getReportsForMonth = async (
  userUid: string,
  year: number,
  monthIndex: number
): Promise<Record<string, DailyReport>> => {
  const colRef = collection(db, 'reports', userUid, 'daily');
  const snaps: QuerySnapshot = await getDocs(colRef);

  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  const reportsInMonth: Record<string, DailyReport> = {};

  snaps.forEach((docSnap) => {
    const data = docSnap.data() as DailyReport;
    if (data.date.startsWith(prefix)) {
      let total = data.totalHours;
      if (total === undefined && FORCED_EIGHT.has(data.activity)) {
        total = 8;
      }
      if (total !== undefined && data.totalHours !== total) {
        data.totalHours = total;
      }
      reportsInMonth[data.date] = data;
    }
  });

  return reportsInMonth;
};

export const saveReportForDate = async (
  userUid: string,
  date: string,
  activity: string,
  startTime?: string,
  endTime?: string
) => {
  let totalHours: number | undefined = undefined;

  if (FORCED_EIGHT.has(activity)) {
    totalHours = 8;
  } else if (startTime && endTime) {
    const [h1, m1] = startTime.split(':').map((s) => parseInt(s, 10));
    const [h2, m2] = endTime.split(':').map((s) => parseInt(s, 10));
    const minutesStart = h1 * 60 + m1;
    const minutesEnd = h2 * 60 + m2;
    const diff = minutesEnd - minutesStart;
    if (diff > 0) {
      totalHours = diff / 60;
    } else {
      totalHours = 0;
    }
  }

  const docRef = doc(db, 'reports', userUid, 'daily', date);
  const data: DailyReport = {
    date,
    activity,
    createdAt: Timestamp.now(),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(totalHours !== undefined ? { totalHours } : {}),
  };
  await setDoc(docRef, data);
};