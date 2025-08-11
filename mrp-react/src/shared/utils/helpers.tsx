import { jwtDecode, JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
  const token = getToken();
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

export async function deleteSongReview(reviewId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/reviews/song/delete/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to delete song review: ${res.status} ${t}`);
  }
}

export async function deleteAlbumReview(reviewId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/reviews/album/delete/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to delete album review: ${res.status} ${t}`);
  }
}
