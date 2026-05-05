import { useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Rating } from "primereact/rating";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";

import {
  AlbumReviewFormData,
  AlbumType,
  MAX_GENRES,
  truncate,
} from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { submitAlbumReview } from "../../features/albums/hooks/submitAlbumReview.ts";
import { CreateAlbumReview } from "../../features/albums/CreateAlbumReview.tsx";
import { toast } from "./ToastContext.tsx";
import { useNavigate } from "react-router-dom";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Props {
  album: AlbumType;
  refetch?: () => void;
}

export default function AlbumCard({ album, refetch }: Props) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const navigate = useNavigate();
  const toastRef = useRef<Toast | null>(null);

  const {
    loading: loadingImage,
    exists: imageExists,
    image: image,
  } = useGetImage(
    album.imageUrl ? `${VITE_BACKEND_URL}${album.imageUrl}` : undefined,
  );

  const genres = album.genres ?? [];
  const visibleGenres = genres.slice(0, MAX_GENRES);
  const hasMoreGenres = genres.length > MAX_GENRES;
  const hiddenGenresTitle = genres
    .slice(MAX_GENRES)
    .map((g) => g.name)
    .join(", ");

  const songsCount = album.songs?.length ?? 0;

  const header = (
    <div className="w-full aspect-video overflow-hidden bg-[#f5f5f5] rounded-tl-[14px] rounded-tr-[14px]">
      {loadingImage ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && image ? image : undefined}
          imageClassName="w-full h-full object-cover block"
          className="block w-full h-full"
        />
      )}
    </div>
  );

  const handleSubmit = async (formData: AlbumReviewFormData) => {
    try {
      await submitAlbumReview(formData);
      toast.success("Successfully reviewed!");
      refetch?.();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      <Card
        className="album-card shadow-md select-none cursor-pointer"
        style={{ width: 320, borderRadius: 14 }}
        header={header}
        onClick={() => navigate(`/album/${album.id}`)}
      >
        <div className="mt-2 px-4 pt-3 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="m-0 text-lg font-bold">{album.name}</h3>
            <span className="inline-flex items-center gap-[6px]">
              <i className="pi pi-headphones" />
              <Badge value={songsCount} />
            </span>
          </div>

          <div className="text-[#6b7280] text-[0.95rem]">Released {album.year}.</div>

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

          <div className="flex flex-col items-center gap-4 mb-2">
            {album.link && (
              <div className="mt-2">
                <Button
                  label="Open Album Link"
                  icon="pi pi-external-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(album.link!, "_blank");
                  }}
                />
              </div>
            )}

            <div className="mt-2">
              {typeof album.grade === "number" ? (
                <Rating value={album.grade} cancel={false} />
              ) : (
                <Button
                  label="Review Album"
                  icon="pi pi-star"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleDialog(true);
                  }}
                />
              )}
            </div>

            {album.averageRating && (
              <div className="flex justify-center gap-2">
                Average:
                <i className="pi pi-star my-auto" />
                {`${album.averageRating} / 5`}
              </div>
            )}
          </div>
        </div>
      </Card>

      {visibleDialog && (
        <CreateAlbumReview
          visible={visibleDialog}
          name={album.name}
          albumId={album.id}
          onHide={() => setVisibleDialog(false)}
          onSubmit={handleSubmit}
        />
      )}

      <Toast ref={toastRef} />
    </>
  );
}
