import { type PlaylistResponseDto, useFetch, type Page } from "@/shared";

export const useGetPublicAndMyPlaylists = () => {
  return useFetch<Page<PlaylistResponseDto>>("/api/playlists/public-and-mine");
};
