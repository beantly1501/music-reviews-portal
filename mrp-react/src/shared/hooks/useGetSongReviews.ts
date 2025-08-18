import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type PageResp<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

type SortMeta = { field: string; order: 1 | -1 };

export function useGetSongReviews(songId?: number) {
  const [data, setData] = useState<ReviewResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<string>("creationDate");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [multiSortMeta, setMultiSortMeta] = useState<SortMeta[]>([]);

  const token = getToken();

  const buildParams = useCallback(
    (nextPage = page, nextRows = rows, sortM: SortMeta[] = multiSortMeta) => {
      const params = new URLSearchParams({
        page: String(nextPage),
        size: String(nextRows),
      });

      if (sortM.length) {
        for (const m of sortM) {
          if (m.field)
            params.append(
              "sort",
              `${m.field},${m.order === 1 ? "asc" : "desc"}`,
            );
        }
      } else if (sortField) {
        params.append(
          "sort",
          `${sortField},${sortOrder === 1 ? "asc" : "desc"}`,
        );
      } else {
        params.append("sort", "creationDate,desc");
      }
      return params;
    },
    [page, rows, multiSortMeta, sortField, sortOrder],
  );

  const fetchPage = useCallback(
    async (
      nextPage = page,
      nextRows = rows,
      sortM: SortMeta[] = multiSortMeta,
    ) => {
      if (!songId) return;
      setLoading(true);
      setError(null);
      try {
        const params = buildParams(nextPage, nextRows, sortM);
        const res = await fetch(
          `${VITE_BACKEND_URL}/reviews/song/all/${songId}?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Failed: ${res.status}`);
        }
        const json = (await res.json()) as PageResp<ReviewResponse>;

        setData(json.content ?? []);
        setTotal(json.totalElements ?? json.content?.length ?? 0);
        setPage(json.number ?? nextPage);
        setRows(json.size ?? nextRows);
      } catch (e: unknown) {
        setError(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [songId, page, rows, multiSortMeta, buildParams],
  );

  const onPage = useCallback(
    (e: { first: number; rows: number; page?: number }) => {
      const nextPage =
        typeof e.page === "number" ? e.page : Math.floor(e.first / e.rows);
      setPage(nextPage);
      setRows(e.rows);
      fetchPage(nextPage, e.rows);
    },
    [fetchPage],
  );

  const onSort = useCallback(
    (e: { sortField?: string; sortOrder?: 1 | -1 }) => {
      const sf = e.sortField ?? sortField;
      const so = (e.sortOrder as 1 | -1) ?? sortOrder ?? -1;
      setSortField(sf);
      setSortOrder(so);
      setMultiSortMeta([]);
      setPage(0);
      fetchPage(0, rows, []);
    },
    [fetchPage, rows, sortField, sortOrder],
  );

  const refresh = useCallback(
    () => fetchPage(page, rows),
    [fetchPage, page, rows],
  );

  useEffect(() => {
    if (songId) {
      setPage(0);
      fetchPage?.(0, rows);
    }
  }, [songId]);

  return {
    reviews: data,
    total,
    page,
    rows,
    loading,
    error,
    sortField,
    sortOrder,
    multiSortMeta,
    onPage,
    onSort,
    refresh,
  };
}
