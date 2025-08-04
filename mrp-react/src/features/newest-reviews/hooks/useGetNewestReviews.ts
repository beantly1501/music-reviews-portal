import { useState, useEffect } from "react";
import { extractErrorMessage, ReviewResponse } from "@shared/utils";

export function useGetNewestReviews(count = 20) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwt");
        const url = `/api/reviews/newest?count=${encodeURIComponent(count)}`;
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
        if (!cancelled) setReviews(data);
      } catch (e: unknown) {
        if (!cancelled)
          setError(extractErrorMessage(e) || "Failed to fetch reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [count]);

  return { reviews, loading, error };
}
