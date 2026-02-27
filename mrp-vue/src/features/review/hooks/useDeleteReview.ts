import { useAuthStore } from "@/shared";

export const useDeleteReview = () => {
  const { token } = useAuthStore();

  const deleteReview = async (reviewId: number, type: "SONG" | "ALBUM") => {
    const url =
      type === "SONG"
        ? `/api/reviews/song/delete/${reviewId}`
        : `/api/reviews/album/delete/${reviewId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete review: ${response.status}`);
    }

    return true;
  };

  return { deleteReview };
};
