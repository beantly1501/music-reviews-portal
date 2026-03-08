import { type Page, type ReviewResponse, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetSongReviews = (
  songId: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const id = typeof songId === "object" ? songId.value : songId;
    return id ? `/api/reviews/song/all/${id}` : undefined;
  });

  return useFetch<Page<ReviewResponse>>(url, { immediate: true });
};
