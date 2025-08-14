import { useCallback, useEffect, useState } from "react";
import {
  extractErrorMessage,
  getToken,
  PageResponse,
  PlaylistType,
} from "@shared/utils";

type Options = {
  page?: number;
  size?: number;
  sort?: string | string[];
  scope?: "public" | "mine" | "admin";
};

export function useGetPlaylists(options: Options = {}) {
  const {
    page: initialPage = 0,
    size: initialSize = 100,
    sort,
    scope = "public",
  } = options;

  const [data, setData] = useState<PlaylistType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(initialPage);
  const [size, setSize] = useState<number>(initialSize);

  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      if (sort) {
        const sorts = Array.isArray(sort) ? sort : [sort];
        sorts.forEach((s) => params.append("sort", s));
      }

      const url = `/api/playlists/${scope}?${params.toString()}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching playlists`);
      }

      const json = await res.json();

      if (Array.isArray(json)) {
        const arr = json as PlaylistType[];
        setData(arr);
        setTotalElements(arr.length);
        setTotalPages(1);
        setIsFirst(true);
        setIsLast(true);
      } else {
        const pg = json as PageResponse<PlaylistType>;
        setData(pg.content ?? []);
        setTotalElements(pg.totalElements ?? 0);
        setTotalPages(pg.totalPages ?? 0);

        setPage(pg.number);
        setSize(pg.size);
        setIsFirst(!!pg.first);
        setIsLast(!!pg.last);
      }
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, scope]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchData();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  return {
    data,
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
    refetch: fetchData,
  };
}
