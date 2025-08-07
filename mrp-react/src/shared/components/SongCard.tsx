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

  const coverUrl = song.cover ? toDataUrl(song.cover) : null;

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

  // Fetch audio file
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
        // handle error silently
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

  const header = coverUrl ? (
    <img
      src={coverUrl}
      alt={song.name}
      className="img-fluid"
      style={{ maxHeight: "200px", objectFit: "cover", borderRadius: "0.5rem" }}
    />
  ) : null;

  const footer = (
    <div className="flex flex-column align-content-center align-items-center justify-content-center gap-2">
      <div className="mx-auto">
        {loadingAudio ? (
          <i className="pi pi-spin pi-spinner" />
        ) : (
          song.file && <audio controls ref={audioRef} />
        )}
      </div>
      {song.link && (
        <Button
          label="Open Spotify / Youtube link"
          icon="pi pi-external-link"
          className="mx-auto"
          onClick={() => window.open(song.link, "_blank")}
        />
      )}
      {song.reviewed ? (
        <Rating
          className="mt-3"
          value={song.grade}
          unselectable="on"
          cancel={false}
        />
      ) : (
        <Button
          label="Review Song"
          icon="pi pi-star"
          className="mx-auto"
          onClick={() => setVisibleDialog(true)}
        />
      )}
    </div>
  );

  return (
    <>
      <Card
        title={
          <div className="flex justify-content-between">
            <p className="m-0 p-0">{song.name}</p>
            {song.reviewed && <Tag value="Reviewed" severity="success" />}
          </div>
        }
        subTitle={`Released ${song.year}`}
        header={header}
        footer={footer}
        className="p-shadow-2 p-mb-4"
      >
        {song.genres && song.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {song.genres.map((genre) => (
              <Chip key={genre.id ?? genre.name} label={genre.name} />
            ))}
          </div>
        )}
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
