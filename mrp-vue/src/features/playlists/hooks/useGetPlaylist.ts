import { type PlaylistResponseDto, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetPlaylist = (
  id: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const playlistId = typeof id === "object" ? id.value : id;
    return playlistId ? `/api/playlists/${playlistId}` : undefined;
  });

  return useFetch<PlaylistResponseDto>(url, { immediate: true });
};
