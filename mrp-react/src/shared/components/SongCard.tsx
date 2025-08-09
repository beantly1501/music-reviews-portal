// src/features/songs/SongCard.tsx
import { useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import "primeflex/primeflex.css";

import { SongReviewFormData, SongType } from "@shared/utils";
import noImageAvailable from "../../assets/images/no-image-available.jpg";
import { useGetImage } from "../hooks/useGetImage.ts";
import { useSongAudio } from "../hooks/useSongAudio.ts";
import { submitSongReview } from "../../features/songs/hooks/submitSongReview.ts";
import { CreateSongReview } from "../../features/songs/CreateSongReview.tsx";

interface Props {
  song: SongType;
  refetch: () => void;
}

export default function SongCard({ song, refetch }: Props) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const toastRef = useRef<Toast | null>(null);

  // Image (works for song/album/artist endpoints passed as a URL string)
  const {
    loading: loadingImage,
    exists: imageExists,
    url: imageUrl,
  } = useGetImage(`/api/${song.imageUrl}`);

  // Audio (deduped/cached fetch by song id + fileUrl)
  const {
    loading: loadingAudio,
    exists: audioExists,
    url: audioUrl,
  } = useSongAudio(song.id, song.fileUrl);

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

  return (
    <>
      <Card className="song-card p-shadow-2">
        {/* Artwork */}
        <div className="song-card__img-wrapper">
          {loadingImage ? (
            <div className="song-card__img placeholder flex align-items-center justify-content-center">
              <i className="pi pi-spin pi-spinner" />
            </div>
          ) : (
            <img
              src={imageExists && imageUrl ? imageUrl : noImageAvailable}
              alt={song.name}
              className="song-card__img"
            />
          )}
        </div>

        {/* Body */}
        <div className="song-card__content">
          {/* Title row */}
          <div className="song-card__title-row">
            <h3 className="song-card__title">{song.name}</h3>
            <Tag
              value="Reviewed"
              severity="success"
              style={{ visibility: song.reviewed ? "visible" : "hidden" }}
            />
          </div>

          <div className="song-card__subtitle">Released {song.year}</div>

          {/* Genres */}
          <div className="song-card__chips">
            {song.genres?.map((g) => (
              <Chip key={g.id} label={g.name} className="h-2rem" />
            ))}
          </div>

          {/* Spacer pushes controls to bottom */}
          <div className="song-card__spacer" />

          {/* Controls */}
          <div className="song-card__controls">
            {/* Audio */}
            <div className="song-card__audio">
              {loadingAudio ? (
                <i className="pi pi-spin pi-spinner" />
              ) : audioExists && audioUrl ? (
                <audio controls src={audioUrl} />
              ) : (
                <div className="song-card__placeholder" />
              )}
            </div>

            {/* External link */}
            <div className="song-card__link">
              <Button
                label="Open Spotify / Youtube link"
                icon="pi pi-external-link"
                onClick={() => song.link && window.open(song.link, "_blank")}
                style={{ visibility: song.link ? "visible" : "hidden" }}
              />
            </div>

            {/* Review */}
            <div className="song-card__review">
              {song.grade ? (
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
        onSubmit={handleSubmit}
      />
      <Toast ref={toastRef} />
    </>
  );
}
