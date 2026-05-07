import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Image } from "primereact/image";
import { useGetImage } from "../hooks/useGetImage";
import { PlaylistType } from "@shared/utils";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function PlaylistCard({ playlist }: { playlist: PlaylistType }) {
  const navigate = useNavigate();

  const isPublic = !playlist.isPrivate;

  const {
    loading: loadingImage,
    exists: imageExists,
    image: image,
  } = useGetImage(`${VITE_BACKEND_URL}${playlist.image}`);

  const songsCount = Array.isArray(playlist.songs) ? playlist.songs.length : 0;

  const collaboratorsCount = Array.isArray(playlist.collaborators)
    ? playlist.collaborators.length
    : 0;

  const header = (
    <div className="w-full h-[180px] bg-[#f5f5f5] overflow-hidden relative">
      {loadingImage ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && image ? image : undefined}
          alt={`${playlist.name} cover`}
          imageClassName="w-full h-full object-cover block"
          className="block w-full h-full"
        />
      )}
    </div>
  );

  return (
    <Card
      className="playlist-card select-none cursor-pointer"
      style={{ width: 320, display: "flex", flexDirection: "column" }}
      header={header}
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="flex flex-col p-5 gap-2">
        <div className="flex items-center justify-between min-h-[40px] mb-1">
          <h3 className="m-0 text-xl leading-tight truncate flex-1 min-w-0">{playlist.name}</h3>
          <Tag
            value={isPublic ? "Public" : "Private"}
            severity={isPublic ? "success" : "secondary"}
            rounded
          />
        </div>

        {playlist.description && (
          <p className="text-[#374151] leading-relaxed">{playlist.description}</p>
        )}

        <div className="flex items-center justify-between pt-[6px]">
          <Tag value={playlist.ownerUsername} severity="warning" />
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-[6px]">
              <i className="pi pi-headphones" />
              <Badge value={songsCount} />
            </span>
            <span className="inline-flex items-center gap-[6px]">
              <i className="pi pi-users" />
              <Badge value={collaboratorsCount} />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
