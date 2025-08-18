import {
  extractErrorMessage,
  AlbumType,
  getToken,
  Options,
  PageResponse,
} from "@shared/utils";
import { useEffect, useState, useCallback } from "react";

export function useGetAlbums(options: Options = {}) {
  const { page: initialPage = 0, size: initialSize = 20, sort } = options;

  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(initialPage);
  const [size, setSize] = useState<number>(initialSize);

  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(true);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      if (sort) {
        const sorts = Array.isArray(sort) ? sort : [sort];
        sorts.forEach((s) => params.append("sort", s));
      }

      const res = await fetch(`/api/album/all?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();

      if (Array.isArray(json)) {
        const arr = json as AlbumType[];
        setAlbums(arr);
        setTotalElements(arr.length);
        setTotalPages(1);
        setIsFirst(true);
        setIsLast(true);
      } else {
        const pg = json as PageResponse<AlbumType>;
        setAlbums(pg.content ?? []);
        setTotalElements(pg.totalElements ?? 0);
        setTotalPages(pg.totalPages ?? 0);
        if (typeof pg.number === "number") setPage(pg.number);
        if (typeof pg.size === "number") setSize(pg.size);
        setIsFirst(!!pg.first);
        setIsLast(!!pg.last);
      }
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, size, sort]);

  useEffect(() => {
    void fetchAlbums();
  }, [fetchAlbums]);

  return {
    albums,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    isFirst,
    isLast,
    hasPreviousPage: !isFirst && totalPages > 0,
    hasNextPage: !isLast && totalPages > 0,
    setPage,
    setSize,
    refetch: fetchAlbums,
  };
}
