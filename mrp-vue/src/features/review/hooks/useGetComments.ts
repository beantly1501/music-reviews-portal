import { useFetch, type CommentResponse, type Page } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetComments = (
  reviewId: Ref<number | undefined> | number | undefined,
  reviewType: Ref<"SONG" | "ALBUM" | undefined> | "SONG" | "ALBUM" | undefined,
) => {
  const url = computed(() => {
    const id = typeof reviewId === "object" ? reviewId.value : reviewId;
    const type = typeof reviewType === "object" ? reviewType.value : reviewType;
    if (!id || !type) return undefined;
    const seg = type === "SONG" ? "song" : "album";
    return `/api/comments/${seg}/${id}?page=0&size=20&sort=creationDate,desc`;
  });

  return useFetch<Page<CommentResponse>>(url, { immediate: true });
};
