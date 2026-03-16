import { type PlaylistResponseDto, useFetch, type Page } from "@/shared";

export const useGetMyPlaylists = () => {
  return useFetch<Page<PlaylistResponseDto>>("/api/playlists/mine");
};
