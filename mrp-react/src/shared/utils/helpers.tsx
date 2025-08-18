import { jwtDecode, JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const res = await fetch(`${VITE_BACKEND_URL}/auth/validate`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
}

export async function ensureValidTokenOrRefresh() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return false;
  }
  const stillValid = await checkServerTokenValidity(token);
  if (!stillValid) {
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

export function extractErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export const getToken = () => localStorage.getItem("jwt");

export function parseIdList(input: string | undefined): number[] {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
}

export const truncate = (name: string, max = 15) =>
  name.length > max ? name.slice(0, max) + "..." : name;

export function toCommaSeparated<T>(arr: T[]): string {
  return arr.map(String).join(", ");
}
