import { db } from '../firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

export type DailyReport = {
  date: string;     
  activity: string; 
  createdAt: Timestamp;
};

export const getReportForDate = async (
  userUid: string,
  date: string
): Promise<DailyReport | null> => {
  const docRef = doc(db, 'reports', userUid, 'daily', date);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as DailyReport) : null;
};

export const saveReportForDate = async (
  userUid: string,
  date: string,
  activity: string
) => {
  const docRef = doc(db, 'reports', userUid, 'daily', date);
  const data: DailyReport = {
    date,
    activity,
    createdAt: Timestamp.now(),
  };
  await setDoc(docRef, data);
};
