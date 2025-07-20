import { BACKEND_URL, SongType } from "@shared/utils";
import { useEffect, useState } from "react";

export function useGetSongs() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 1) a plain async fetch function you’ll call on mount or on demand
  async function fetchSongs() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/song/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SongType[] = await res.json();
      setSongs(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  // 2) run it once on mount
  useEffect(() => {
    fetchSongs();
  }, []);

  // 3) expose it so your dialog can call it after a successful create
  return { songs, loading, error, refetch: fetchSongs };
}
