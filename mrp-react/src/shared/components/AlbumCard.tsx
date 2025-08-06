import { useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import "primeflex/primeflex.css";
import { submitAlbumReview } from "../../features/albums/hooks/submitAlbumReview";
import { AlbumReviewFormData, AlbumType, toDataUrl } from "@shared/utils";
import { CreateAlbumReview } from "../../features/albums/CreateAlbumReview.tsx";

interface Props {
  album: AlbumType;
  refetch: () => void;
}

export default function AlbumCard({ album, refetch }: Props) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const toastRef = useRef<Toast | null>(null);

  const coverUrl = album.cover ? toDataUrl(album.cover) : null;

  const handleSubmit = async (formData: AlbumReviewFormData) => {
    try {
      await submitAlbumReview(formData);
      toastRef.current?.show({
        severity: "success",
        summary: `Reviewed ${album.name}`,
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

  const header = coverUrl ? (
    <img
      src={coverUrl}
      alt={album.name}
      className="img-fluid"
      style={{ maxHeight: "200px", objectFit: "cover", borderRadius: "0.5rem" }}
    />
  ) : null;

  const footer = (
    <div className="flex flex-column align-items-center justify-content-center gap-2">
      {album.link && (
        <Button
          label="Open Album Link"
          icon="pi pi-external-link"
          className="w-14rem"
          onClick={() => window.open(album.link, "_blank")}
        />
      )}
      {!album.reviewed && (
        <Button
          label="Review Album"
          icon="pi pi-star"
          className="w-12rem"
          onClick={() => setVisibleDialog(true)}
        />
      )}
    </div>
  );

  return (
    <>
      <Card
        title={album.name}
        subTitle={`Released ${album.year ?? "N/A"}`}
        header={header}
        footer={footer}
        className="p-shadow-2 p-mb-4"
        style={{ width: "300px" }}
      />
      <CreateAlbumReview
        visible={visibleDialog}
        albumId={album.id}
        name={album.name}
        onHide={() => setVisibleDialog(false)}
        onSubmit={handleSubmit}
      />
      <Toast ref={toastRef} />
    </>
  );
}
