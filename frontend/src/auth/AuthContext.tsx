import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, api } from '../api/client';

const STORAGE_KEY = 'urlmgmt.token';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); the session then lasts until reload.
  }
}

interface AuthState {
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);

  // Drop a stored token that the server no longer accepts (expired or revoked).
  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    api.me(token).catch((error: unknown) => {
      if (!cancelled && error instanceof ApiError && error.status === 401) {
        storeToken(null);
        setToken(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password);
    storeToken(response.access_token);
    setToken(response.access_token);
  }, []);

  const logout = useCallback(() => {
    storeToken(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, isAdmin: token !== null, login, logout }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
