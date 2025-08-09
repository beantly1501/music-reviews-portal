// src/features/songs/SongCard.tsx
import { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { SongReviewFormData, SongType, toDataUrl } from "@shared/utils";
import "primeflex/primeflex.css";
import { CreateSongReview } from "../../features/songs/CreateSongReview.tsx";
import { Toast } from "primereact/toast";
import { submitSongReview } from "../../features/songs/hooks/submitSongReview.ts";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import noImageAvailable from "../../assets/images/no-image-available.jpg";

interface Props {
  song: SongType;
  refetch: () => void;
}

export default function SongCard({ song, refetch }: Props) {
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const toastRef = useRef<Toast | null>(null);

  const coverUrl = song.cover ? toDataUrl(song.cover) : noImageAvailable;

  const handleSubmit = async (formData: SongReviewFormData) => {
    try {
      await submitSongReview(formData);
      toastRef.current?.show({
        severity: "success",
        summary: `Reviewed ${song.name}`,
        life: 3000,
      });
      refetch();
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Error creating review",
        life: 3000,
      });
    }
  };

  // fetch audio (only when the song has a file)
  useEffect(() => {
    if (!song.file) return;
    const controller = new AbortController();
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const fetchAudio = async () => {
      setLoadingAudio(true);
      try {
        const res = await fetch(`/api/song/audio-file/${song.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Fetch audio failed: ${res.status}`);
        const blob = await res.blob();
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        if (audioRef.current) audioRef.current.src = url;
      } catch {
        // ignore
      } finally {
        setLoadingAudio(false);
      }
    };

    fetchAudio();
    return () => {
      controller.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [song.id, song.file]);

  return (
    <>
      <Card className="song-card p-shadow-2">
        {/* fixed image section */}
        <img src={coverUrl} alt={song.name} className="song-card__img" />

        <div className="song-card__content">
          {/* title row (tag space reserved even when hidden) */}
          <div className="song-card__title-row">
            <h3 className="song-card__title">{song.name}</h3>
            <Tag
              value="Reviewed"
              severity="success"
              style={{ visibility: song.reviewed ? "visible" : "hidden" }}
            />
          </div>

          <div className="song-card__subtitle">Released {song.year}</div>

          {/* chips (fixed-height block) */}
          <div className="song-card__chips">
            {song.genres?.map((g) => (
              <Chip key={g.id} label={g.name} className="h-2rem" />
            ))}
          </div>

          {/* push controls to bottom */}
          <div className="song-card__spacer" />

          {/* controls (each row fixed height) */}
          <div className="song-card__controls">
            <div className="song-card__audio">
              {loadingAudio ? (
                <i className="pi pi-spin pi-spinner" />
              ) : song.file ? (
                <audio controls ref={audioRef} />
              ) : (
                <div className="song-card__placeholder" />
              )}
            </div>

            <div className="song-card__link">
              <Button
                label="Open Spotify / Youtube link"
                icon="pi pi-external-link"
                onClick={() => song.link && window.open(song.link, "_blank")}
                style={{ visibility: song.link ? "visible" : "hidden" }}
              />
            </div>

            <div className="song-card__review">
              {song.reviewed ? (
                <Rating value={song.grade} cancel={false} />
              ) : (
                <Button
                  label="Review Song"
                  icon="pi pi-star"
                  onClick={() => setVisibleDialog(true)}
                />
              )}
            </div>
          </div>
        </div>
      </Card>

      <CreateSongReview
        visible={visibleDialog}
        name={song.name}
        songId={song.id}
        onHide={() => setVisibleDialog(false)}
        onSubmit={(data) => handleSubmit(data)}
      />
      <Toast ref={toastRef} />
    </>
  );
}
