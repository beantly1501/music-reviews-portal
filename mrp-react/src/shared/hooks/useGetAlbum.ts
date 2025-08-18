import { useCallback, useEffect, useState } from "react";
import { getToken, AlbumType } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetAlbum(id?: number) {
  const [album, setAlbum] = useState<AlbumType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setAlbum(undefined);
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
      const res = await fetch(`${VITE_BACKEND_URL}/album/${id}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AlbumType = await res.json();
      setAlbum(json);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load album.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { album, loading, error, refetch };
}
