// hooks/useGetGenres.ts
import { useEffect, useState, useCallback } from "react";
import { extractErrorMessage, GenreType } from "@shared/utils";

export function useGetGenres() {
  const [genres, setGenres] = useState<GenreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch("/api/genre/all", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: GenreType[] = await res.json();
      setGenres(data);
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGenres();
  }, [fetchGenres]);

  return { genres, loading, error, refetch: fetchGenres };
}
