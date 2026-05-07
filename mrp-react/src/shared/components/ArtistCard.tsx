import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { ArtistType } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import { Badge } from "primereact/badge";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Props {
  artist: ArtistType;
}

export default function ArtistCard({ artist }: Props) {
  const navigate = useNavigate();

  const { loading, exists, image } = useGetImage(
    artist.imageUrl ? `${VITE_BACKEND_URL}${artist.imageUrl}` : undefined,
  );

  const header = (
    <div className="mb-4 w-full h-[180px] bg-[#f5f5f5]">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={exists && image ? image : undefined}
          imageClassName="w-full h-full object-cover block"
          className="block w-full h-full"
        />
      )}
    </div>
  );

  const songsCount = artist.songs?.length ?? 0;
  const albumsCount = artist.albums?.length ?? 0;

  return (
    <Card
      header={header}
      className="artist-card shadow-md cursor-pointer select-none"
      style={{ width: 300 }}
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <h3 className="m-0 text-xl font-bold truncate">{artist.name}</h3>
      {artist.description && (
        <p className="mt-5 text-sm text-[#374151]">{artist.description}</p>
      )}
      <div className="flex gap-2 justify-end">
        <span className="inline-flex items-center gap-[6px]">
          <i className="pi pi-headphones" />
          <Badge value={songsCount} />
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <i className="pi pi-folder-open" />
          <Badge value={albumsCount} />
        </span>
      </div>
    </Card>
  );
}
