import { Card } from "primereact/card";
import { ArtistType, toDataUrl } from "@shared/utils";

interface Props {
  artist: ArtistType;
}

export default function ArtistCard({ artist }: Props) {
  const imageUrl = artist.image ? toDataUrl(artist.image) : null;

  const header = imageUrl ? (
    <img
      src={imageUrl}
      alt={artist.name}
      className="img-fluid"
      style={{
        maxHeight: "200px",
        objectFit: "cover",
        borderRadius: "0.5rem",
      }}
    />
  ) : null;

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
