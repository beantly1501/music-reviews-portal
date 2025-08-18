import { getToken, SongReviewFormData } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function submitSongReview(data: SongReviewFormData) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${VITE_BACKEND_URL}/reviews/song/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit review: ${res.status} ${errText}`);
  }

  return await res.json();
}
