import { useCallback, useEffect, useState } from "react";
import { getToken, SongType } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetSong(id?: number) {
  const [song, setSong] = useState<SongType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (overrideId?: number): Promise<void> => {
      const effectiveId = overrideId ?? id;

      if (!effectiveId) {
        setSong(undefined);
        setLoading(false);
        setError(null);
        return;
      }

      const token = getToken();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${VITE_BACKEND_URL}/song/${effectiveId}`, {
          headers,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: SongType = await res.json();
        setSong(json);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load song.");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { song, loading, error, refetch };
}
