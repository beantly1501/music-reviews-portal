import { useCallback, useEffect, useState } from "react";
import { getToken } from "@shared/utils";

export function useGetImage(requestUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageAsJsFile, setImageAsJsFile] = useState<File | null>(null);

  const refetch = useCallback(async () => {
    if (!requestUrl) {
      setLoading(false);
      setExists(false);
      setImage(null);
      setImageAsJsFile(null);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      setExists(false);
      setImage(null);
      setImageAsJsFile(null);
      return;
    }

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
        setImageAsJsFile(null);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      setImage(objectUrl);
      setImageAsJsFile(
        new File([blob], "image", {
          type: blob.type || "application/octet-stream",
          lastModified: Date.now(),
        }),
      );
      setExists(true);
    } catch {
      setExists(false);
      setImage(null);
      setImageAsJsFile(null);
    } finally {
      setLoading(false);
    }
  }, [requestUrl]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { loading, exists, image, imageAsJsFile, refetch };
}
