// hooks/useSongAudio.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "@shared/utils";

// Module-level cache for object URLs
const audioUrlCache = new Map<string, string>();

export function useSongAudio(songId: number, fileUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const [nonce, setNonce] = useState(0); // bump to force refetch on refresh()

  // same key as before; keeps behavior identical
  const key = `${songId}-${fileUrl ?? ""}`;

  const refresh = useCallback(() => {
    // revoke old cached URL (avoid memory leaks) and delete cache entry
    const old = audioUrlCache.get(key);
    if (old) {
      URL.revokeObjectURL(old);
      audioUrlCache.delete(key);
    }
    setNonce((n) => n + 1); // trigger effect to refetch
  }, [key]);

  useEffect(() => {
    mountedRef.current = true;

    if (!fileUrl) {
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

    // Serve from cache if present
    const cached = audioUrlCache.get(key);
    if (cached) {
      setUrl(cached);
      setExists(true);
      return () => {
        mountedRef.current = false;
      };
    }

    // Fetch and cache
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/song/audio-file/${songId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch audio failed: ${res.status}`);

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        // Replace any previously cached URL for this key (safety)
        const prev = audioUrlCache.get(key);
        if (prev) URL.revokeObjectURL(prev);
        audioUrlCache.set(key, objectUrl);

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
  }, [songId, fileUrl, key, nonce]);

  return { loading, exists, url, refresh };
}
