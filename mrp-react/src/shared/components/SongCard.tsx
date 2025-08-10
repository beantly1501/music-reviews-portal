import { useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import "primeflex/primeflex.css";

import { SongReviewFormData, SongType } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { useSongAudio } from "../hooks/useSongAudio";
import { submitSongReview } from "../../features/songs/hooks/submitSongReview.ts";
import { CreateSongReview } from "../../features/songs/CreateSongReview.tsx";

interface Props {
  song: SongType;
  refetch: () => void;
}

export default function SongCard({ song, refetch }: Props) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const toastRef = useRef<Toast | null>(null);

  const {
    loading: loadingImage,
    exists: imageExists,
    url: imageUrl,
  } = useGetImage(`/api${song.imageUrl}`);

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

  const header = (
    <div className="song-card__img-wrap">
      {loadingImage ? (
        <div className="song-card__img placeholder flex align-items-center justify-content-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && imageUrl ? imageUrl : undefined}
          imageStyle={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      )}
    </div>
  );

  return (
    <>
      <Card className="song-card p-card p-shadow-2" header={header}>
        <div className="song-card__content">
          <div className="song-card__title-row">
            <h3 className="song-card__title">{song.name}</h3>
            <Tag
              value="Reviewed"
              severity="success"
              style={{ visibility: song.grade ? "visible" : "hidden" }}
            />
          </div>

          <div className="song-card__subtitle">Released {song.year}</div>

          <div className="song-card__chips">
            {song.genres?.map((g) => (
              <Chip key={g.id} label={g.name} className="h-2rem" />
            ))}
          </div>

          <div className="song-card__spacer" />

          <div className="song-card__controls">
            <div className="song-card__audio">
              {loadingAudio ? (
                <i className="pi pi-spin pi-spinner" />
              ) : audioExists && audioUrl ? (
                <audio controls src={audioUrl} />
              ) : (
                <div className="song-card__placeholder">
                  No audio file available.
                </div>
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
