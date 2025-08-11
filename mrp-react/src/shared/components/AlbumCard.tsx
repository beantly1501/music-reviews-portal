import { useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import "primeflex/primeflex.css";

import { AlbumType, AlbumReviewFormData } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { submitAlbumReview } from "../../features/albums/hooks/submitAlbumReview.ts";
import { CreateAlbumReview } from "../../features/albums/CreateAlbumReview.tsx";
import { toast } from "./ToastContext.tsx";
import { useNavigate } from "react-router-dom";

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
  } = useGetImage(album.imageUrl ? `/api${album.imageUrl}` : undefined);

  const header = (
    <div className="album-card__img-wrap">
      {loadingImage ? (
        <div className="album-card__img placeholder flex align-items-center justify-content-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && image ? image : undefined}
          imageClassName="album-card__img"
          className="album-card__img-container"
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
        className="album-card p-shadow-2"
        header={header}
        onClick={() => navigate(`/album/${album.id}`)}
      >
        <div className="album-card__body">
          <div className="album-card__title-row">
            <h3 className="album-card__title">{album.name}</h3>
            <Tag
              value="Reviewed"
              severity="success"
              style={{ visibility: album.grade ? "visible" : "hidden" }}
            />
          </div>

          <div className="album-card__subtitle">Released {album.year}.</div>

          <div className="flex flex-column align-items-center gap-4 mb-2">
            {album.link && (
              <div className="album-card__actions">
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

            <div className="album-card__rating">
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
