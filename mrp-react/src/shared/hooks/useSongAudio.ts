import { useEffect, useRef, useState } from "react";
import { getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useSongAudio(songId: number, fileUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [audioAsJsFile, setAudioAsJsFile] = useState<File | null>(null);
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
      setAudioAsJsFile(null);
      return;
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      setExists(false);
      setUrl(null);
      setAudioAsJsFile(null);
      return;
    }

    setLoading(true);
    fetch(`${VITE_BACKEND_URL}${fileUrl}`, {
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
          setAudioAsJsFile(null);
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setUrl(objectUrl);

        setAudioAsJsFile(
          new File([blob], "audio", {
            type: blob.type || "application/octet-stream",
            lastModified: Date.now(),
          }),
        );
        setExists(true);
      })
      .catch(() => {
        if (mounted) {
          setExists(false);
          setUrl(null);
          setAudioAsJsFile(null);
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

  return { loading, exists, url, audioAsJsFile };
}
