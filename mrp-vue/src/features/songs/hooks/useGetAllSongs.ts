import { type SongResponse, useFetch } from "@/shared";

export const useGetAllSongs = () => {
  return useFetch<SongResponse[]>("/api/song/all");
};
