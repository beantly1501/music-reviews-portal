import { type SongResponse, useFetch } from "@/shared";
import { computed, type Ref } from "vue";

export const useGetSong = (
  id: Ref<number | undefined> | number | undefined,
) => {
  const url = computed(() => {
    const songId = typeof id === "object" ? id.value : id;
    return songId ? `/api/song/${songId}` : undefined;
  });

  return useFetch<SongResponse>(url, { immediate: true });
};
