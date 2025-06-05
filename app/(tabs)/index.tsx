// app/(tabs)/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const MONTH_NAMES = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
];

export default function RedirectToCurrentMonth() {
  const router = useRouter();
  const today = new Date();
  const year = today.getFullYear();
  const monthName = MONTH_NAMES[today.getMonth()];

  useEffect(() => {
    router.replace(`/${year}/${monthName}`);
  }, [router, year, monthName]);

  return null;
}
