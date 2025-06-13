import { db } from '../config/firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  Timestamp,
  QuerySnapshot,
} from 'firebase/firestore';

export type DailyReport = {
  date: string;         
  activity: string;     
  startTime?: string;   
  endTime?: string;      
  totalHours?: number;   
  createdAt: Timestamp;
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