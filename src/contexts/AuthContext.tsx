import { createContext } from 'react';

export type User = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  project?: string;
};

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  setUser: () => {},
});
