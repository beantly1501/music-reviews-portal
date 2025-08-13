import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { ArtistType } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { Badge } from "primereact/badge";
import { useNavigate } from "react-router-dom";

interface Props {
  artist: ArtistType;
}

export default function ArtistCard({ artist }: Props) {
  const navigate = useNavigate();

  const { loading, exists, image } = useGetImage(
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
          src={exists && image ? image : undefined}
          imageClassName="artist-card__img"
          className="artist-card__img-container"
        />
      )}
    </div>
  );

  const songsCount = artist.songs?.length ?? 0;
  const albumsCount = artist.albums?.length ?? 0;

  return (
    <Card
      header={header}
      title={artist.name}
      className="artist-card p-shadow-2 cursor-pointer select-none"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      {artist.description && (
        <p className="artist-card__desc">{artist.description}</p>
      )}
      <div className="flex gap-2 justify-content-end">
        <span className="card-stat">
          <i className="pi pi-headphones" />
          <Badge value={songsCount} />
        </span>
        <span className="card-stat">
          <i className="pi pi-folder-open" />
          <Badge value={albumsCount} />
        </span>
      </div>
    </Card>
  );
}
