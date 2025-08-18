import { useCallback, useEffect, useState } from "react";
import {
  extractErrorMessage,
  getToken,
  PageResponse,
  PlaylistType,
} from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type Options = {
  page?: number;
  size?: number;
  sort?: string | string[];
  userId?: number | string;
};

export function useGetPublicPlaylists(options: Options = {}) {
  const {
    page: initialPage = 0,
    size: initialSize = 20,
    sort,
    userId,
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
    if (userId == null) {
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
      setIsFirst(true);
      setIsLast(true);
      setLoading(false);
      setError("Missing userId");
      return;
    }

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

      const idPath = encodeURIComponent(String(userId));
      const url = `${VITE_BACKEND_URL}/playlists/public/${idPath}?${params.toString()}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching public playlists`);
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
        if (typeof pg.number === "number") setPage(pg.number);
        if (typeof pg.size === "number") setSize(pg.size);
        setIsFirst(!!pg.first);
        setIsLast(!!pg.last);
      }
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, userId]);

  useEffect(() => {
    void fetchData();
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
