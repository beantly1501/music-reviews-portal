import { AlbumReviewFormData, getToken } from "@shared/utils";

export async function updateAlbumReview(
  reviewId: number,
  data: AlbumReviewFormData,
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/reviews/album/update/${reviewId}`, {
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
    throw new Error(`Failed to update album review: ${res.status} ${errText}`);
  }
}
