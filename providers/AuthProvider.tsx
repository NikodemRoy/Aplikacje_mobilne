
import { AuthContext, User } from '../contexts/AuthContext';
import { auth, getCurrentUserProfile, loginUser, logoutUser, registerUser } from '../services/dataService';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await getCurrentUserProfile(firebaseUser);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    if (user) {
      setUser(user);
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  const registerEmployee = async (email: string, password: string): Promise<boolean> => {
    return await registerUser(email, password);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        registerEmployee, 
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};