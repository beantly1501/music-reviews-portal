import { jwtDecode, JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router";
import { UserInfo } from "./types.tsx";
import { useCallback, useEffect, useState } from "react";

export function formatDate(input: string): string {
  const [d, M, y] = input.split("-").map(Number);
  const utcDate = new Date(Date.UTC(y, M - 1, d));
  return utcDate.toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "narrow",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // reader.result is like "data:<mime>;base64,AAAABBBB..."
      const base64 = (reader.result as string).split(",", 2)[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
  });

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return true; // no expiration => treat as invalid
    return Date.now() >= exp * 1000;
  } catch {
    return true; // malformed token
  }
}

export async function checkServerTokenValidity(
  token: string,
): Promise<boolean> {
  const res = await fetch("/api/auth/validate", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
}

export async function ensureValidTokenOrRefresh() {
  const token = localStorage.getItem("jwt");
  if (!token || isTokenExpired(token)) {
    // attempt refresh or redirect to login-register
    // e.g., call /api/auth/refresh and replace token
    return false;
  }
  const stillValid = await checkServerTokenValidity(token);
  if (!stillValid) {
    // token was revoked/invalid on server
    return false;
  }
  return true;
}

export function useLogout() {
  const navigate = useNavigate();
  return () => {
    localStorage.removeItem("jwt");
    navigate("/login", { replace: true });
  };
}

export function useCurrentUser() {
  const [state, setState] = useState<{
    user: UserInfo | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState({ user: null, loading: true, error: null });

    const token = localStorage.getItem("jwt");
    if (!token) {
      setState({ user: null, loading: false, error: "No auth token" });
      return;
    }

    try {
      const res = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setState({ user: null, loading: false, error: "Unauthorized" });
        } else if (res.status === 404) {
          setState({ user: null, loading: false, error: "User not found" });
        } else {
          const text = await res.text();
          setState({
            user: null,
            loading: false,
            error: text || `Request failed: ${res.status}`,
          });
        }
        return;
      }

      const user: UserInfo = await res.json();
      setState({ user, loading: false, error: null });
    } catch (e: unknown) {
      setState({
        user: null,
        loading: false,
        error: extractErrorMessage(e),
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    refresh: fetchUser,
  };
}

export function extractErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    // try stringify in case it's some object
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

// Utility: convert a Base64 string into a data URL
export function toDataUrl(base64: string, mimeType = "image/jpeg"): string {
  return `data:${mimeType};base64,${base64}`;
}
