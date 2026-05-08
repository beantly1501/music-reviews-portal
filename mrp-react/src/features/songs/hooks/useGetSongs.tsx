import {
  extractErrorMessage,
  getToken,
  SongType,
  PageResponse,
} from "@shared/utils";
import { useEffect, useState, useCallback, useRef } from "react";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

export type SongFilters = {
  genreIds: number[];
  artistIds: number[];
  albumIds: number[];
};

const EMPTY_FILTERS: SongFilters = {
  genreIds: [],
  artistIds: [],
  albumIds: [],
};

export function useGetSongs() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SongFilters>(EMPTY_FILTERS);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeQueryRef = useRef("");
  const activeFiltersRef = useRef<SongFilters>(EMPTY_FILTERS);

  const fetchPage = useCallback(
    async (query: string, f: SongFilters, pageNum: number) => {
      const isFirstPage = pageNum === 0;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      try {
        const token = getToken();
        const params = new URLSearchParams({
          page: String(pageNum),
          size: String(PAGE_SIZE),
        });
        if (query.trim()) params.set("q", query.trim());
        f.genreIds.forEach((id) => params.append("genreIds", String(id)));
        f.artistIds.forEach((id) => params.append("artistIds", String(id)));
        f.albumIds.forEach((id) => params.append("albumIds", String(id)));

        const res = await fetch(`${VITE_BACKEND_URL}/song/filter?${params}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data: PageResponse<SongType> = await res.json();
        const incoming = data.content ?? [];

        setSongs((prev) => (isFirstPage ? incoming : [...prev, ...incoming]));
        setPage(data.number ?? pageNum);
        setTotalPages(data.totalPages ?? 1);
        setError(null);
      } catch (e: unknown) {
        setError(extractErrorMessage(e));
      } finally {
        if (isFirstPage) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchPage("", EMPTY_FILTERS, 0);
  }, [fetchPage]);

  const triggerFetch = useCallback(
    (query: string, f: SongFilters) => {
      activeQueryRef.current = query;
      activeFiltersRef.current = f;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchPage(query, f, 0);
      }, DEBOUNCE_MS);
    },
    [fetchPage],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      triggerFetch(value, activeFiltersRef.current);
    },
    [triggerFetch],
  );

  const handleFiltersChange = useCallback(
    (f: SongFilters) => {
      setFilters(f);
      triggerFetch(activeQueryRef.current, f);
    },
    [triggerFetch],
  );

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch("");
    activeQueryRef.current = "";
    void fetchPage("", activeFiltersRef.current, 0);
  }, [fetchPage]);

  const clearFilters = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters(EMPTY_FILTERS);
    activeFiltersRef.current = EMPTY_FILTERS;
    void fetchPage(activeQueryRef.current, EMPTY_FILTERS, 0);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    if (nextPage >= totalPages || loadingMore) return;
    void fetchPage(activeQueryRef.current, activeFiltersRef.current, nextPage);
  }, [fetchPage, page, totalPages, loadingMore]);

  const refetch = useCallback(
    () => fetchPage(activeQueryRef.current, activeFiltersRef.current, 0),
    [fetchPage],
  );

  const hasMore = page + 1 < totalPages;
  const hasActiveFilters =
    filters.genreIds.length > 0 ||
    filters.artistIds.length > 0 ||
    filters.albumIds.length > 0;

  return {
    songs,
    loading,
    loadingMore,
    error,
    refetch,
    search,
    filters,
    hasActiveFilters,
    onSearchChange: handleSearchChange,
    onFiltersChange: handleFiltersChange,
    clearSearch,
    clearFilters,
    hasMore,
    loadMore,
  };
}
