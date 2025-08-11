import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";

type PageResp<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export function useGetAlbumReviews(albumId?: number) {
  const [data, setData] = useState<ReviewResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<string>("creationDate");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);

  const token = getToken();

  const buildParams = useCallback(
    (nextPage = page, nextRows = rows) => {
      const params = new URLSearchParams({
        page: String(nextPage),
        size: String(nextRows),
      });

      if (sortField) {
        params.append(
          "sort",
          `${sortField},${sortOrder === 1 ? "asc" : "desc"}`,
        );
      } else {
        params.append("sort", "creationDate,desc");
      }
      return params;
    },
    [page, rows, sortField, sortOrder],
  );

  const fetchPage = useCallback(
    async (nextPage = page, nextRows = rows) => {
      if (!albumId) return;
      setLoading(true);
      setError(null);
      try {
        const params = buildParams(nextPage, nextRows);
        const res = await fetch(
          `/api/reviews/album/all/${albumId}?${params.toString()}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
    [albumId, page, rows, buildParams, token],
  );

  // PrimeReact DataTable events
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
      setPage(0);
      fetchPage(0, rows);
    },
    [fetchPage, rows, sortField, sortOrder],
  );

  const refresh = useCallback(
    () => fetchPage(page, rows),
    [fetchPage, page, rows],
  );

  useEffect(() => {
    if (albumId) {
      setPage(0);
      fetchPage(0, rows);
    }
  }, [albumId, fetchPage, rows]);

  return {
    reviews: data,
    total,
    page,
    rows,
    loading,
    error,
    sortField,
    sortOrder,
    onPage,
    onSort,
    refresh,
  };
}
