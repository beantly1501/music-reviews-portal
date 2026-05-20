import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/shared";
import type { SongResponse, Page } from "@/shared";

export type SongFilters = {
  genreIds: number[];
  artistIds: number[];
  albumIds: number[];
};

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

const EMPTY_FILTERS: SongFilters = { genreIds: [], artistIds: [], albumIds: [] };

export const useGetSongs = () => {
  const songs = ref<SongResponse[]>([]);
  const page = ref(0);
  const totalPages = ref(1);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<Error | null>(null);
  const search = ref("");
  const filters = ref<SongFilters>({ ...EMPTY_FILTERS });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeQuery = "";
  let activeFilters: SongFilters = { ...EMPTY_FILTERS };

  const hasActiveFilters = computed(
    () =>
      filters.value.genreIds.length > 0 ||
      filters.value.artistIds.length > 0 ||
      filters.value.albumIds.length > 0,
  );

  const hasMore = computed(() => page.value + 1 < totalPages.value);

  const { token } = useAuthStore();

  const fetchPage = async (query: string, f: SongFilters, pageNum: number) => {
    const isFirst = pageNum === 0;
    if (isFirst) isLoading.value = true;
    else isLoadingMore.value = true;

    error.value = null;

    try {
      const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());
      f.genreIds.forEach((id) => params.append("genreIds", String(id)));
      f.artistIds.forEach((id) => params.append("artistIds", String(id)));
      f.albumIds.forEach((id) => params.append("albumIds", String(id)));

      const res = await fetch(`/api/song/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: Page<SongResponse> = await res.json();
      songs.value = isFirst ? data.content : [...songs.value, ...data.content];
      page.value = data.number;
      totalPages.value = data.totalPages;
    } catch (e) {
      error.value = e as Error;
    } finally {
      if (isFirst) isLoading.value = false;
      else isLoadingMore.value = false;
    }
  };

  const triggerFetch = (query: string, f: SongFilters) => {
    activeQuery = query;
    activeFilters = f;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchPage(query, f, 0), DEBOUNCE_MS);
  };

  const onSearchChange = (value: string) => {
    search.value = value;
    triggerFetch(value, activeFilters);
  };

  const onFiltersChange = (f: SongFilters) => {
    filters.value = f;
    triggerFetch(activeQuery, f);
  };

  const clearSearch = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    search.value = "";
    activeQuery = "";
    fetchPage("", activeFilters, 0);
  };

  const clearFilters = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    filters.value = { ...EMPTY_FILTERS };
    activeFilters = { ...EMPTY_FILTERS };
    fetchPage(activeQuery, { ...EMPTY_FILTERS }, 0);
  };

  const loadMore = () => {
    if (!hasMore.value || isLoadingMore.value) return;
    fetchPage(activeQuery, activeFilters, page.value + 1);
  };

  const refetch = () => fetchPage(activeQuery, activeFilters, 0);

  onMounted(() => fetchPage("", { ...EMPTY_FILTERS }, 0));

  return {
    songs,
    isLoading,
    isLoadingMore,
    error,
    search,
    filters,
    hasActiveFilters,
    hasMore,
    onSearchChange,
    onFiltersChange,
    clearSearch,
    clearFilters,
    loadMore,
    refetch,
  };
};
