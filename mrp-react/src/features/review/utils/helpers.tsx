import { getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function deleteSongReview(reviewId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(
    `${VITE_BACKEND_URL}/reviews/song/delete/${reviewId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to delete song review: ${res.status} ${t}`);
  }
}

export async function deleteAlbumReview(reviewId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(
    `${VITE_BACKEND_URL}/reviews/album/delete/${reviewId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed to delete album review: ${res.status} ${t}`);
  }
}
