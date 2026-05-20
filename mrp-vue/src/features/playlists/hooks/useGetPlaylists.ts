import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/shared";
import type { PlaylistResponseDto, Page } from "@/shared";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

export const useGetPlaylists = () => {
  const playlists = ref<PlaylistResponseDto[]>([]);
  const page = ref(0);
  const totalPages = ref(1);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<Error | null>(null);
  const search = ref("");

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeQuery = "";

  const hasMore = computed(() => page.value + 1 < totalPages.value);

  const { token } = useAuthStore();

  const fetchPage = async (query: string, pageNum: number) => {
    const isFirst = pageNum === 0;
    if (isFirst) isLoading.value = true;
    else isLoadingMore.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`/api/playlists/public-and-mine?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: Page<PlaylistResponseDto> = await res.json();
      playlists.value = isFirst ? data.content : [...playlists.value, ...data.content];
      page.value = data.number;
      totalPages.value = data.totalPages;
    } catch (e) {
      error.value = e as Error;
    } finally {
      if (isFirst) isLoading.value = false;
      else isLoadingMore.value = false;
    }
  };

  const onSearchChange = (value: string) => {
    search.value = value;
    activeQuery = value;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchPage(value, 0), DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    search.value = "";
    activeQuery = "";
    fetchPage("", 0);
  };

  const loadMore = () => {
    if (!hasMore.value || isLoadingMore.value) return;
    fetchPage(activeQuery, page.value + 1);
  };

  const refetch = () => fetchPage(activeQuery, 0);

  onMounted(() => fetchPage("", 0));

  return {
    playlists,
    isLoading,
    isLoadingMore,
    error,
    search,
    hasMore,
    onSearchChange,
    clearSearch,
    loadMore,
    refetch,
  };
};
