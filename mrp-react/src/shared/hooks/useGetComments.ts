import { useCallback, useEffect, useState } from "react";
import { CommentResponse, extractErrorMessage } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetComments(
  reviewId: number | undefined,
  reviewType: "SONG" | "ALBUM" | undefined,
) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!reviewId || !reviewType) return;

    const segment = reviewType === "SONG" ? "song" : "album";
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${VITE_BACKEND_URL}/comments/${segment}/${reviewId}?page=0&size=20&sort=creationDate,desc`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setComments(json.content ?? []);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [reviewId, reviewType]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { comments, loading, error, refresh: fetch_ };
}
