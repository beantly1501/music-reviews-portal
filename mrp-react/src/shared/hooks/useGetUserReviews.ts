import { useCallback, useEffect, useState } from "react";
import { ReviewResponse, extractErrorMessage, getToken } from "@shared/utils";

type Options = {
  count?: number;
};

export function useGetUserReviews(userId: number, options: Options = {}) {
  const { count } = options;

  const [reviews, setReviews] = useState<ReviewResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (userId == null) {
      setReviews([]);
      setLoading(false);
      setError("Missing userId");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const params = new URLSearchParams();
      if (count && count > 0) params.set("count", String(count));

      const url = `/api/reviews/user/${encodeURIComponent(String(userId))}${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching user reviews`);
      }

      const json = (await res.json()) as ReviewResponse[];
      setReviews(json ?? []);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [userId, count]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { reviews, loading, error, refetch: fetchData };
}
