import { getToken, SongReviewFormData } from "@shared/utils";

export async function submitSongReview(data: SongReviewFormData) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/song-review/create", {
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
