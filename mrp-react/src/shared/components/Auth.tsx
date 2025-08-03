// auth.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { exp?: number; sub?: string };

const AUTH_TOKEN_KEY = "jwt";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  checking: boolean; // while verifying
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  );
  const [checking, setChecking] = useState(true);

  const isExpired = (t: string) => {
    try {
      const { exp } = jwtDecode<JwtPayload>(t);
      if (!exp) return true;
      return Date.now() >= exp * 1000 - 30_000; // 30s leeway
    } catch {
      return true;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
  }, []);

  const login = useCallback((t: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, t);
    setToken(t);
  }, []);

  // optional: validate with server once on mount
  useEffect(() => {
    (async () => {
      if (!token) {
        setChecking(false);
        return;
      }
      if (isExpired(token)) {
        logout();
        setChecking(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          logout();
        }
      } catch {
        // network error, optionally keep token or logout
      } finally {
        setChecking(false);
      }
    })();
  }, [token, logout]);

  const value: AuthContextValue = {
    token,
    isAuthenticated: !!token,
    checking,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  console.log(v);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
