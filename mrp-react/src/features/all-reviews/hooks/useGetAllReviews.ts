import { useState, useEffect, useCallback } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";

interface UseGetAllReviewsResult {
  reviews: ReviewResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGetAllReviews(): UseGetAllReviewsResult {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const jwt = getToken();
    if (!jwt) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reviews/all", {
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
  }, []);

  useEffect(() => {
    fetchAll?.();
  }, [fetchAll]);

  return { reviews, loading, error, refetch: fetchAll };
}
