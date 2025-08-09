import { AlbumReviewFormData, getToken } from "@shared/utils";

export async function submitAlbumReview(data: AlbumReviewFormData) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/album-review/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit album review: ${res.status} ${errText}`);
  }

  return res.json();
}
