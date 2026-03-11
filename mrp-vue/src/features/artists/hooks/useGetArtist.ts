import { type ArtistResponseDto, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetArtist = (
  id: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const artistId = typeof id === "object" ? id.value : id;
    return artistId ? `/api/artist/${artistId}` : undefined;
  });

  return useFetch<ArtistResponseDto>(url, { immediate: true });
};
