import { getToken, SongReviewFormData } from "@shared/utils";

export async function updateSongReview(
  reviewId: number,
  data: SongReviewFormData,
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/reviews/song/update/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Failed to update review: ${res.status} ${errText}`);
  }
}
