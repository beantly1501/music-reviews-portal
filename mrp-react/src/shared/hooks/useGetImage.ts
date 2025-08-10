import { useEffect, useState } from "react";
import { getToken } from "@shared/utils";

export function useGetImage(requestUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!requestUrl) {
      setLoading(false);
      setExists(false);
      setImage(null);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      setExists(false);
      setImage(null);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(requestUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();

        if (!blob || blob.size === 0) {
          setExists(false);
          setImage(null);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setImage(objectUrl);
        setExists(true);
      } catch {
        setExists(false);
        setImage(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [requestUrl]);

  return { loading, exists, image };
}
