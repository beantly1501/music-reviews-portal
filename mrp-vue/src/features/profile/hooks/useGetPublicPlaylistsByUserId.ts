import { computed, type Ref } from "vue";
import { type PlaylistResponseDto, useFetch, type Page } from "@/shared";

export const useGetPublicPlaylistsByUserId = (id: Ref<string | string[] | undefined>) => {
  const url = computed(() => (id.value ? `/api/playlists/public/${id.value}` : undefined));
  return useFetch<Page<PlaylistResponseDto>>(url);
};
