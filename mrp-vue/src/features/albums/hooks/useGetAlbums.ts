import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/shared";
import type { AlbumResponseDto, Page } from "@/shared";

export type AlbumFilters = {
  artistIds: number[];
  genreIds: number[];
  songIds: number[];
};

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

const EMPTY_FILTERS: AlbumFilters = { artistIds: [], genreIds: [], songIds: [] };

export const useGetAlbums = () => {
  const albums = ref<AlbumResponseDto[]>([]);
  const page = ref(0);
  const totalPages = ref(1);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<Error | null>(null);
  const search = ref("");
  const filters = ref<AlbumFilters>({ ...EMPTY_FILTERS });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeQuery = "";
  let activeFilters: AlbumFilters = { ...EMPTY_FILTERS };

  const hasActiveFilters = computed(
    () =>
      filters.value.artistIds.length > 0 ||
      filters.value.genreIds.length > 0 ||
      filters.value.songIds.length > 0,
  );

  const hasMore = computed(() => page.value + 1 < totalPages.value);

  const { token } = useAuthStore();

  const fetchPage = async (query: string, f: AlbumFilters, pageNum: number) => {
    const isFirst = pageNum === 0;
    if (isFirst) isLoading.value = true;
    else isLoadingMore.value = true;

    error.value = null;

    try {
      const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());
      f.artistIds.forEach((id) => params.append("artistIds", String(id)));
      f.genreIds.forEach((id) => params.append("genreIds", String(id)));
      f.songIds.forEach((id) => params.append("songIds", String(id)));

      const res = await fetch(`/api/album/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: Page<AlbumResponseDto> = await res.json();
      albums.value = isFirst ? data.content : [...albums.value, ...data.content];
      page.value = data.number;
      totalPages.value = data.totalPages;
    } catch (e) {
      error.value = e as Error;
    } finally {
      if (isFirst) isLoading.value = false;
      else isLoadingMore.value = false;
    }
  };

  const triggerFetch = (query: string, f: AlbumFilters) => {
    activeQuery = query;
    activeFilters = f;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchPage(query, f, 0), DEBOUNCE_MS);
  };

  const onSearchChange = (value: string) => {
    search.value = value;
    triggerFetch(value, activeFilters);
  };

  const onFiltersChange = (f: AlbumFilters) => {
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
    albums,
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
