import { db } from '../config/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  FirestoreError
} from 'firebase/firestore';

export type UserProfile = {
  firstName: string;
  lastName: string;
  project: 'Retail' | 'E-commerce' | 'Customer support' | 'Ekspert';
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