import { useEffect, useState } from "react";
import { getToken, SongType } from "@shared/utils";

export function useGetSong(id?: number) {
  const [song, setSong] = useState<SongType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setSong(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const token = getToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    setLoading(true);
    setError(null);

    fetch(`/api/song/${id}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: SongType) => setSong(json))
      .catch((e: any) => setError(e?.message ?? "Failed to load song."))
      .finally(() => setLoading(false));
  }, [id]);

  return { song, loading, error };
}
