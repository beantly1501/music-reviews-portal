import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, PlaylistType } from "@shared/utils";

export interface PlaylistRow {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  isPrivate: boolean;
  ownerUsername: string;
  songsCount: number;
  collaboratorsCount: number;
}

type Options = {
  page?: number;
  size?: number;
};

export function useGetPlaylists(options: Options = {}) {
  const { page = 0, size = 20 } = options;

  const [data, setData] = useState<PlaylistType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken(); // <- credentials
      const url = `/api/playlists/public?page=${encodeURIComponent(
        page,
      )}&size=${encodeURIComponent(size)}`;

      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching playlists`);
      }

      const json = (await res.json()) as PlaylistType[];
      setData(json);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, size]);

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
    refetch: fetchData,
  };
}
