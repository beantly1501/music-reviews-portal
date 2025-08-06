import { extractErrorMessage, SongType } from "@shared/utils";
import { useEffect, useState, useCallback } from "react";

export function useGetSongs() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch function
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch("/api/song/all", {
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
