import { useAuthStore } from "@/shared";
import type { SongReviewForm, AlbumReviewForm } from "@/shared";

export const useUpdateReview = () => {
  const { token } = useAuthStore();

  const updateSongReview = async (
    reviewId: number,
    formData: SongReviewForm,
  ) => {
    const response = await fetch(`/api/reviews/song/update/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update song review: ${response.status}`);
    }

    return await response.json();
  };

  const updateAlbumReview = async (
    reviewId: number,
    formData: AlbumReviewForm,
  ) => {
    const response = await fetch(`/api/reviews/album/update/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update album review: ${response.status}`);
    }

    return await response.json();
  };

  return { updateSongReview, updateAlbumReview };
};
