import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAevUWb2zHpI4Z03T7jkQKz6aR186l4FSk',
  authDomain: 'raporty-f0a30.firebaseapp.com',
  projectId: 'raporty-f0a30',
  storageBucket: 'raporty-f0a30.firebasestorage.app',
  messagingSenderId: '403582187355',
  appId: '1:403582187355:web:6b0436c30fd20aa8454c7e',
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
