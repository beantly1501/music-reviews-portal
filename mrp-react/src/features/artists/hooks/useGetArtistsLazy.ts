import { extractErrorMessage, getToken, PageResponse, ArtistType } from "@shared/utils";
import { useCallback, useRef, useState } from "react";

export type ArtistOption = { id: number; name: string };

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export function useGetArtistsLazy() {
  const [items, setItems] = useState<ArtistOption[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const queryRef = useRef("");
  const pageRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPage = useCallback(async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(PAGE_SIZE),
      });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`${VITE_BACKEND_URL}/artist/search?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PageResponse<ArtistType> = await res.json();
      const incoming: ArtistOption[] = (data.content ?? []).map((a) => ({
        id: a.id,
        name: a.name,
      }));
      pageRef.current = pageNum;
      setHasMore(pageNum + 1 < (data.totalPages ?? 1));
      setItems((prev) => (pageNum === 0 ? incoming : [...prev, ...incoming]));
    } catch (e) {
      extractErrorMessage(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onFilter = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        queryRef.current = query;
        void fetchPage(query, 0);
      }, DEBOUNCE_MS);
    },
    [fetchPage],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    void fetchPage(queryRef.current, pageRef.current + 1);
  }, [fetchPage, hasMore, loading]);

  const initialize = useCallback(() => {
    queryRef.current = "";
    pageRef.current = 0;
    setItems([]);
    setHasMore(false);
    void fetchPage("", 0);
  }, [fetchPage]);

  return { items, hasMore, loading, onFilter, loadMore, initialize };
}
