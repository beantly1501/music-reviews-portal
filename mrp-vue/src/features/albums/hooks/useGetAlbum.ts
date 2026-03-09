import { type AlbumResponseDto, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetAlbum = (
  id: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const albumId = typeof id === "object" ? id.value : id;
    return albumId ? `/api/album/${albumId}` : undefined;
  });

  return useFetch<AlbumResponseDto>(url, { immediate: true });
};
