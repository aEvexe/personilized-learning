import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { isAuthenticatedFromCookies, logout as authLogout } from '../services/auth.service';

export interface AuthContextType {
  isAuthenticated: boolean;
  authUserId: string | null;
  isNewUser: boolean;
  setAuthenticated: (val: boolean) => void;
  setAuthUserId: (id: string | null) => void;
  setIsNewUser: (val: boolean) => void;
  login: () => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(() => isAuthenticatedFromCookies());
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const checkAuth = useCallback(() => {
    const authed = isAuthenticatedFromCookies();
    setAuthenticated(authed);
    return authed;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setAuthenticated(false);
    setAuthUserId(null);
    setIsNewUser(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authUserId,
        isNewUser,
        setAuthenticated,
        setAuthUserId,
        setIsNewUser,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
