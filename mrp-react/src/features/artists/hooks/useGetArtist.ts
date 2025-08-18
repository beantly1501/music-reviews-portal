import { useCallback, useEffect, useState } from "react";
import { getToken, ArtistType, extractErrorMessage } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetArtist(id?: number) {
  const [artist, setArtist] = useState<ArtistType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setArtist(undefined);
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
      const res = await fetch(`${VITE_BACKEND_URL}/artist/${id}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ArtistType = await res.json();
      setArtist(json);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { artist, loading, error, refetch };
}
