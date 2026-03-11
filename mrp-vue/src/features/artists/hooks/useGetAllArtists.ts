import { type ArtistResponseDto, useFetch } from "@/shared";

export const useGetAllArtists = () => {
  return useFetch<ArtistResponseDto[]>("/api/artist/all");
};
