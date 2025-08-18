import { useState, useEffect, useCallback } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetNewestRatings(count = 20) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const url = `${VITE_BACKEND_URL}/reviews/newest?count=${encodeURIComponent(count)}`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ReviewResponse[];
      setReviews(data);
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    void fetchNewest();
  }, [fetchNewest]);

  return { reviews, loading, error, refetch: fetchNewest };
}
