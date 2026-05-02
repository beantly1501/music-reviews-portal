import { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Image } from "primereact/image";

import {
  MAX_GENRES,
  SongReviewFormData,
  SongType,
  truncate,
} from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { useSongAudio } from "../hooks/useSongAudio";
import { submitSongReview } from "../../features/songs/hooks/submitSongReview.ts";
import { CreateSongReview } from "../../features/songs/CreateSongReview.tsx";
import { toast } from "./ToastContext.tsx";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Props {
  song: SongType;
  refetch: () => void;
}

export default function SongCard({ song, refetch }: Props) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const navigate = useNavigate();

  const genres = song.genres ?? [];
  const visibleGenres = genres.slice(0, MAX_GENRES);
  const hasMoreGenres = genres.length > MAX_GENRES;
  const hiddenGenresTitle = genres
    .slice(MAX_GENRES)
    .map((g) => g.name)
    .join(", ");

  const {
    loading: loadingImage,
    exists: imageExists,
    image: image,
  } = useGetImage(`${VITE_BACKEND_URL}${song.imageUrl}`);

  const {
    loading: loadingAudio,
    exists: audioExists,
    url: audioUrl,
  } = useSongAudio(song.id, song.fileUrl);

  const handleSubmit = async (formData: SongReviewFormData) => {
    try {
      await submitSongReview(formData);
      toast.success(`Successfully reviewed ${song.name}`);
      refetch();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const header = (
    <div className="w-full h-[180px] bg-[#f5f5f5] overflow-hidden">
      {loadingImage ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && image ? image : undefined}
          imageStyle={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      )}
    </div>
  );

  return (
    <>
      <Card
        className="song-card shadow-md select-none cursor-pointer"
        style={{ width: 320, height: 560, display: "flex", flexDirection: "column" }}
        header={header}
        onClick={() => navigate(`/song/${song.id}`)}
      >
        <div className="flex flex-col px-5 py-5 flex-1">
          <div className="flex items-center justify-between min-h-[40px] mb-1">
            <h3 className="m-0 text-xl leading-tight line-clamp-2">{song.name}</h3>
            <Tag
              value="Reviewed"
              severity="success"
              style={{ visibility: song.grade ? "visible" : "hidden" }}
            />
          </div>

          <div className="min-h-[22px] text-[#6b6b6b]">Released {song.year}.</div>

          <div className="min-h-[44px] flex flex-wrap gap-2 mt-2">
            {visibleGenres.map((g) => (
              <Chip key={g.id} label={truncate(g.name, 10)} className="h-8" />
            ))}
            {hasMoreGenres && (
              <span
                title={hiddenGenresTitle}
                aria-label={`and ${genres.length - MAX_GENRES} more genres`}
              >
                …
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex flex-col gap-[25px] pt-2">
            <div className="h-[42px] flex items-center">
              {loadingAudio ? (
                <i className="pi pi-spin pi-spinner" />
              ) : audioExists && audioUrl ? (
                <audio controls src={audioUrl} className="w-full" />
              ) : (
                <div className="w-full h-full">No audio file available.</div>
              )}
            </div>

            <div className="h-[44px] flex items-center justify-center">
              <Button
                label="Open Spotify / Youtube link"
                icon="pi pi-external-link"
                onClick={(e) => {
                  e.stopPropagation();
                  if (song.link) window.open(song.link, "_blank");
                }}
                style={{ visibility: song.link ? "visible" : "hidden" }}
              />
            </div>

            <div className="h-[44px] flex items-center justify-center">
              {song.grade ? (
                <Rating value={song.grade} cancel={false} />
              ) : (
                <Button
                  label="Review Song"
                  icon="pi pi-star"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleDialog(true);
                  }}
                />
              )}
            </div>

            {song.averageRating && (
              <div className="flex justify-center gap-2">
                Average:
                <i className="pi pi-star my-auto" />
                {`${song.averageRating} / 5`}
              </div>
            )}
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
    </>
  );
}
