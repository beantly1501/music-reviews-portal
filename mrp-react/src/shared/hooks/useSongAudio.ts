// src/features/songs/hooks/useSongAudio.ts
import { useEffect, useRef, useState } from "react";
import { getToken } from "@shared/utils";

export function useSongAudio(songId: number, fileUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // revoke previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // nothing to fetch
    if (!songId && !fileUrl) {
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
    fetch(`/api${fileUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!mounted) return;
        // guard against empty/unknown blobs
        if (!blob || blob.size === 0) {
          setExists(false);
          setUrl(null);
          return;
        }
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
  }, [songId, fileUrl]);

  return { loading, exists, url };
}
