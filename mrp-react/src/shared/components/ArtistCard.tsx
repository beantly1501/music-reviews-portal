import { Card } from "primereact/card";
import { ArtistType } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage.ts";
import noImageAvailable from "../../assets/images/no-image-available.jpg";

interface Props {
  artist: ArtistType;
}

export default function ArtistCard({ artist }: Props) {
  const {
    loading: loadingImage,
    exists: imageExists,
    url: imageUrl,
  } = useGetImage(`/api/${artist.imageUrl}`);

  const header = loadingImage ? (
    <div className="song-card__img placeholder flex align-items-center justify-content-center">
      <i className="pi pi-spin pi-spinner" />
    </div>
  ) : (
    <img
      src={imageExists && imageUrl ? imageUrl : noImageAvailable}
      alt={artist.name}
      className="song-card__img"
    />
  );

  return (
    <Card
      title={artist.name}
      header={header}
      className="p-shadow-2 p-mb-4"
      style={{ width: "300px" }}
    >
      {artist.description && (
        <div className="mt-2">
          <p>{artist.description}</p>
        </div>
      )}
    </Card>
  );
}
