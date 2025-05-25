import { createContext, useState, ReactNode } from 'react';

type User = {
  email: string;
  role: 'admin' | 'worker';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === 'admin@example.com' && password === 'admin') {
      setUser({ email, role: 'admin' });
      return true;
    }

    if (email === 'worker@example.com' && password === 'worker') {
      setUser({ email, role: 'worker' });
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
