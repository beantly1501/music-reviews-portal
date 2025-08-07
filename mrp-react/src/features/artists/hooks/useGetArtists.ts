import { extractErrorMessage, ArtistType } from "@shared/utils";
import { useEffect, useState, useCallback } from "react";

export function useGetArtists() {
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch("/api/artist/all", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: ArtistType[] = await res.json();
      setArtists(data);
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchArtists();
  }, [fetchArtists]);

  console.log(artists, "artists");

  return { artists, loading, error, refetch: fetchArtists };
}
