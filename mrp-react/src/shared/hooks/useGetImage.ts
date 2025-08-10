import { useEffect, useRef, useState } from "react";
import { getToken } from "@shared/utils";

export function useGetImage(requestUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // revoke previous blob url
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!requestUrl) {
      setLoading(false);
      setExists(false);
      setUrl(null);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      setExists(false);
      setUrl(null);
      return;
    }

    setLoading(true);
    fetch(requestUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!mounted) return;
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setUrl(objectUrl);
        setExists(true);
      })
      .catch(() => {
        if (mounted) {
          setExists(false);
          setUrl(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [requestUrl]);

  return { loading, exists, url };
}
