import { type ReviewResponse, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetReview = (
  reviewId: Ref<number | undefined>,
  type: Ref<"SONG" | "ALBUM" | undefined>,
) => {
  const url = computed(() => {
    if (!reviewId.value || !type.value) return undefined;
    return type.value === "SONG"
      ? `/api/reviews/song/${reviewId.value}`
      : `/api/reviews/album/${reviewId.value}`;
  });

  return useFetch<ReviewResponse>(url, { immediate: true });
};
