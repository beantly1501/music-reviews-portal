import { type GenreResponseDto, useFetch } from "@/shared";

export const useGetAllGenres = () => {
  return useFetch<GenreResponseDto[]>("/api/genre/all");
};
