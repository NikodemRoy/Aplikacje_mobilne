// src/services/reportService.ts

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
  const docRef = doc(db, 'reports', userUid, 'daily', date);
  let totalHours: number;
  if (activity !== 'Dzień pracy') {
    totalHours = 8;
  } else if (startTime && endTime) {
    const [h1, m1] = startTime.split(':').map((s) => parseInt(s, 10));
    const [h2, m2] = endTime.split(':').map((s) => parseInt(s, 10));
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    totalHours = diff > 0 ? diff / 60 : 0;
  } else {
    totalHours = 0;
  }
  const data: DailyReport = {
    date,
    activity,
    createdAt: Timestamp.now(),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    totalHours,
  };
  await setDoc(docRef, data);
};
