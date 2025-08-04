import { useEffect, useRef, useState } from "react";
import { extractErrorMessage, SongType } from "@shared/utils";

interface Props {
  song: SongType;
}

export function SongCard({ song }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!song.file) return; // nothing to do if no file

    const controller = new AbortController();
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("No JWT token available");
      return;
    }

    const fetchAudio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/song/audio-file/${song.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(
            `Failed to fetch audio: ${res.status} ${res.statusText}`,
          );
        }

        const blob = await res.blob();
        // Clean up previous object URL if any
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        if (audioRef.current) {
          audioRef.current.src = objectUrl;
        }
      } catch (e: unknown) {
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();

    return () => {
      controller.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [song]);

  console.log(song.cover);

  return (
    <div className="song-card">
      <h3>{song.name}</h3>
      {loading && <div>Loading audio…</div>}
      {song.file && (
        <audio controls ref={audioRef}>
          Your browser doesn’t support inline audio.
        </audio>
      )}
      {song.cover && <img src={song.cover} alt="x" />}
      {/* … cover art, link, year etc. … */}
    </div>
  );
}
