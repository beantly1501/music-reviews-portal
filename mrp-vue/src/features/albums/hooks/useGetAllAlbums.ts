import { type AlbumResponseDto, useFetch, type Page } from "@/shared";

export const useGetAllAlbums = () => {
  return useFetch<Page<AlbumResponseDto>>("/api/album/all");
};
