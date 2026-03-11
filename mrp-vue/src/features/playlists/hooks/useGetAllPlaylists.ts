import { type PlaylistResponseDto, useFetch, type Page } from "@/shared";

export const useGetPublicPlaylists = () => {
  return useFetch<Page<PlaylistResponseDto>>("/api/playlists/public");
};
