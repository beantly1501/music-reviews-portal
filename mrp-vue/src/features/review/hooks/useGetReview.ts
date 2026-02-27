import { type ReviewResponse, useFetch } from "@/shared";
import { computed } from "vue";

export const useGetReview = (
  reviewId: number | undefined,
  type: "SONG" | "ALBUM" | undefined,
) => {
  const url = computed(() => {
    if (!reviewId || !type) return undefined;
    return type === "SONG"
      ? `/api/reviews/song/${reviewId}`
      : `/api/reviews/album/${reviewId}`;
  });

  return useFetch<ReviewResponse>(url, { immediate: true });
};
