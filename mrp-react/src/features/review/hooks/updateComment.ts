import { CommentResponse, getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function updateComment(
  commentId: number,
  reviewType: "SONG" | "ALBUM",
  content: string,
): Promise<CommentResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const segment = reviewType === "SONG" ? "song" : "album";
  const res = await fetch(`${VITE_BACKEND_URL}/comments/${segment}/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update comment: ${res.status} ${errText}`);
  }

  return res.json();
}
