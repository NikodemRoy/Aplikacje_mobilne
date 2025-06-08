import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/app/firebaseConfig';
import { AuthContext, User } from '@/contexts/AuthContext';
import { getUserProfile } from '@/app/services/userService';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          ...profile,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(res.user.uid);
      setUser({
        uid: res.user.uid,
        email: res.user.email || '',
        ...profile,
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  const registerEmployee = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerEmployee, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
