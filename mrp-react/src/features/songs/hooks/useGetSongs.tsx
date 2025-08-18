import { extractErrorMessage, getToken, SongType } from "@shared/utils";
import { useEffect, useState, useCallback } from "react";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetSongs() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${VITE_BACKEND_URL}/song/all`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: SongType[] = await res.json();
      setSongs(data);
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSongs();
  }, [fetchSongs]);

  return { songs, loading, error, refetch: fetchSongs };
}
