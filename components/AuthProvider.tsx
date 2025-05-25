import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/contexts/AuthContext';

type User = {
  email: string;
  role: 'admin' | 'worker';
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const json = await AsyncStorage.getItem('user');
      if (json) {
        setUser(JSON.parse(json));
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    // Hardcoded admin - do ustalenia jak to rozwiazac
    if (email === 'test' && password === '123') {
      const userData: User = { email, role: 'admin' };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return true;
    }

    // pracownik - bedzie trzeba jeszcze rozbudowac
    if (password.length >= 4) {
      const userData: User = { email, role: 'worker' };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
