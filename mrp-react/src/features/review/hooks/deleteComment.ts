import { getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function deleteComment(
  commentId: number,
  reviewType: "SONG" | "ALBUM",
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const segment = reviewType === "SONG" ? "song" : "album";
  const res = await fetch(`${VITE_BACKEND_URL}/comments/${segment}/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete comment: ${res.status} ${errText}`);
  }
}
