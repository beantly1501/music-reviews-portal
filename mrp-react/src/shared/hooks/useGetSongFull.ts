import { useEffect, useState } from "react";
import { getToken, SongType } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGetSongFull(id?: number) {
  const [song, setSong] = useState<SongType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const [songAudioExists, setSongAudioExists] = useState(false);
  const [songAudio, setSongAudio] = useState<string>();
  const [loadingSongAudio, setLoadingSongAudio] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setSong(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const token = getToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    setLoading(true);
    setLoadingSongAudio(true);
    setError(null);

    fetch(`${VITE_BACKEND_URL}/song/${id}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: SongType) => {
        setSong(json);

        fetch(`${VITE_BACKEND_URL}${json.fileUrl}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            if (!blob || blob.size === 0) {
              return;
            }

            const objectUrl = URL.createObjectURL(blob);
            setSongAudio(objectUrl);
            setSongAudioExists(true);
          })
          .finally(() => setLoadingSongAudio(false));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { song, songAudio, songAudioExists, loading, loadingSongAudio, error };
}
