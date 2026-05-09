import { extractErrorMessage, AlbumType, getToken } from "@shared/utils";
import { useEffect, useState, useCallback } from "react";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetAlbumsAll() {
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({ page: "0", size: "1000" });
      const res = await fetch(`${VITE_BACKEND_URL}/album/all?${params}`, {
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
      const arr: AlbumType[] = Array.isArray(json) ? json : (json.content ?? []);
      setAlbums(arr);
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlbums();
  }, [fetchAlbums]);

  return { albums, loading, error, refetch: fetchAlbums };
}
