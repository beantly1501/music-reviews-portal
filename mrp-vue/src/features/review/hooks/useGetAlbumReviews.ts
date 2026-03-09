import { type Page, type ReviewResponse, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetAlbumReviews = (
  albumId: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const id = typeof albumId === "object" ? albumId.value : albumId;
    return id ? `/api/reviews/album/all/${id}` : undefined;
  });

  return useFetch<Page<ReviewResponse>>(url, { immediate: true });
};
