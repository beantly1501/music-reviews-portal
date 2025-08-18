import { useCallback, useEffect, useState } from "react";
import { getToken, PlaylistType } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetPlaylist(id?: number) {
  const [playlist, setPlaylist] = useState<PlaylistType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setPlaylist(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const token = getToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/playlists/${id}`, {
        headers,
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const json: PlaylistType = await res.json();
      setPlaylist(json);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load playlist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { playlist, loading, error, refetch };
}
