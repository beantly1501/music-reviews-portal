import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { ArtistType } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";

interface Props {
  artist: ArtistType;
}

export default function ArtistCard({ artist }: Props) {
  const { loading, exists, url } = useGetImage(
    artist.imageUrl ? `/api${artist.imageUrl}` : undefined,
  );

  const header = (
    <div className="artist-card__img-wrap">
      {loading ? (
        <div className="artist-card__spinner">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={exists && url ? url : undefined}
          imageClassName="artist-card__img"
          className="artist-card__img-container"
        />
      )}
    </div>
  );

  return (
    <Card
      header={header}
      title={artist.name}
      className="artist-card p-shadow-2"
    >
      {artist.description && (
        <p className="artist-card__desc">{artist.description}</p>
      )}
    </Card>
  );
}
