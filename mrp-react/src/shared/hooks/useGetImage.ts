import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "@shared/utils";

// Cache for blob URLs by original request URL
const imageUrlCache = new Map<string, string>();

export function useGetImage(requestUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const [nonce, setNonce] = useState(0); // bump to force refetch

  const refresh = useCallback(() => {
    if (!requestUrl) return;
    const old = imageUrlCache.get(requestUrl);
    if (old) {
      URL.revokeObjectURL(old);
      imageUrlCache.delete(requestUrl);
    }
    setNonce((n) => n + 1); // trigger a re-run of the effect
  }, [requestUrl]);

  useEffect(() => {
    mountedRef.current = true;

    if (!requestUrl) {
      setExists(false);
      setUrl(null);
      return () => {
        mountedRef.current = false;
      };
    }

    const token = getToken();
    if (!token) {
      setExists(false);
      setUrl(null);
      return () => {
        mountedRef.current = false;
      };
    }

    // check cache first
    const cached = imageUrlCache.get(requestUrl);
    if (cached) {
      setUrl(cached);
      setExists(true);
      return () => {
        mountedRef.current = false;
      };
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(requestUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch image failed: ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        // revoke any existing object URL for this key
        const prev = imageUrlCache.get(requestUrl);
        if (prev) URL.revokeObjectURL(prev);
        imageUrlCache.set(requestUrl, objectUrl);

        if (mountedRef.current) {
          setUrl(objectUrl);
          setExists(true);
        }
      } catch {
        if (mountedRef.current) {
          setExists(false);
          setUrl(null);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [requestUrl, nonce]);

  return { loading, exists, url, refresh };
}
