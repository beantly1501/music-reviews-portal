import { CommentResponse, getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function submitComment(
  reviewId: number,
  reviewType: "SONG" | "ALBUM",
  content: string,
): Promise<CommentResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const segment = reviewType === "SONG" ? "song" : "album";
  const res = await fetch(`${VITE_BACKEND_URL}/comments/${segment}/${reviewId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to post comment: ${res.status} ${errText}`);
  }

  return res.json();
}
