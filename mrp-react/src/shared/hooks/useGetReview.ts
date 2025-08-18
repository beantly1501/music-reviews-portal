import { useEffect, useState } from "react";
import { extractErrorMessage, getToken, ReviewResponse } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetReview(id?: number, reviewType?: string) {
  const [review, setReview] = useState<ReviewResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id && id !== 0) {
      setReview(undefined);
      setLoading(false);
      setError("Invalid review id.");
      return;
    }

    const token = getToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    setLoading(true);
    setError(null);

    fetch(
      `${VITE_BACKEND_URL}/reviews${reviewType === "SONG" ? "/song/" : "/album/"}${id}`,
      {
        headers,
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ReviewResponse) => setReview(json))
      .catch((e: unknown) => {
        setError(extractErrorMessage(e));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { review, loading, error };
}
