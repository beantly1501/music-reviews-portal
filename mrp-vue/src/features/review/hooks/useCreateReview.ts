import { useAuthStore } from "@/shared";
import type { SongReviewForm, AlbumReviewForm } from "@/shared";

export const useCreateReview = () => {
  const { token } = useAuthStore();

  const createSongReview = async (formData: SongReviewForm) => {
    const response = await fetch("/api/reviews/song/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create song review: ${response.status}`);
    }

    return await response.json();
  };

  const createAlbumReview = async (formData: AlbumReviewForm) => {
    const response = await fetch("/api/reviews/album/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create album review: ${response.status}`);
    }

    return await response.json();
  };

  return { createSongReview, createAlbumReview };
};
