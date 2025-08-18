import { useState, useEffect, useCallback } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface UseGetMyReviewsResult {
  reviews: ReviewResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGetMyReviews(count?: number): UseGetMyReviewsResult {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const jwt = getToken();
    if (!jwt) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const url = new URL(
        `${VITE_BACKEND_URL}/reviews/mine`,
        window.location.origin,
      );
      if (count !== undefined) {
        url.searchParams.append("count", String(count));
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || response.statusText);
      }

      const data: ReviewResponse[] = await response.json();
      setReviews(data);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return { reviews, loading, error, refresh: fetchRatings };
}
