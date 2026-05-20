import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/shared";
import type { ArtistResponseDto, Page } from "@/shared";

export type ArtistFilters = {
  albumIds: number[];
  songIds: number[];
};

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

const EMPTY_FILTERS: ArtistFilters = { albumIds: [], songIds: [] };

export const useGetArtists = () => {
  const artists = ref<ArtistResponseDto[]>([]);
  const page = ref(0);
  const totalPages = ref(1);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);
  const error = ref<Error | null>(null);
  const search = ref("");
  const filters = ref<ArtistFilters>({ ...EMPTY_FILTERS });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeQuery = "";
  let activeFilters: ArtistFilters = { ...EMPTY_FILTERS };

  const hasActiveFilters = computed(
    () => filters.value.albumIds.length > 0 || filters.value.songIds.length > 0,
  );

  const hasMore = computed(() => page.value + 1 < totalPages.value);

  const { token } = useAuthStore();

  const fetchPage = async (query: string, f: ArtistFilters, pageNum: number) => {
    const isFirst = pageNum === 0;
    if (isFirst) isLoading.value = true;
    else isLoadingMore.value = true;

    error.value = null;

    try {
      const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());
      f.albumIds.forEach((id) => params.append("albumIds", String(id)));
      f.songIds.forEach((id) => params.append("songIds", String(id)));

      const res = await fetch(`/api/artist/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: Page<ArtistResponseDto> = await res.json();
      artists.value = isFirst ? data.content : [...artists.value, ...data.content];
      page.value = data.number;
      totalPages.value = data.totalPages;
    } catch (e) {
      error.value = e as Error;
    } finally {
      if (isFirst) isLoading.value = false;
      else isLoadingMore.value = false;
    }
  };

  const triggerFetch = (query: string, f: ArtistFilters) => {
    activeQuery = query;
    activeFilters = f;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchPage(query, f, 0), DEBOUNCE_MS);
  };

  const onSearchChange = (value: string) => {
    search.value = value;
    triggerFetch(value, activeFilters);
  };

  const onFiltersChange = (f: ArtistFilters) => {
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
    artists,
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
