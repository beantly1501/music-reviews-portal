import { getToken } from "@shared/utils";

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
