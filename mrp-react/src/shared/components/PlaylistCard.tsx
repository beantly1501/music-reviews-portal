import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Image } from "primereact/image";
import { useGetImage } from "../hooks/useGetImage";
import { PlaylistType } from "@shared/utils";
import { useNavigate } from "react-router-dom";

export default function PlaylistCard({ playlist }: { playlist: PlaylistType }) {
  const navigate = useNavigate();

  const isPublic = !playlist.isPrivate;

  const {
    loading: loadingImage,
    exists: imageExists,
    image: image,
  } = useGetImage(`/api${playlist.image}`);

  const songsCount = Array.isArray(playlist.songs) ? playlist.songs.length : 0;

  const collaboratorsCount = Array.isArray(playlist.collaborators)
    ? playlist.collaborators.length
    : 0;

  const header = (
    <div className="media-img-wrap">
      {loadingImage ? (
        <div className="media-spinner">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={imageExists && image ? image : undefined}
          alt={`${playlist.name} cover`}
          imageClassName="media-img"
          className="media-img-container"
        />
      )}
    </div>
  );

  return (
    <Card
      className="playlist-card select-none cursor-pointer"
      header={header}
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="card-body">
        <div className="card-title-row">
          <h3 className="card-title">{playlist.name}</h3>
          <Tag
            value={isPublic ? "Public" : "Private"}
            severity={isPublic ? "success" : "secondary"}
            rounded
          />
        </div>

        {playlist.description && (
          <p className="card-desc">{playlist.description}</p>
        )}

        <div className="card-meta-row">
          <Tag value={playlist.ownerUsername} severity="warning" />
          <div className="card-stats">
            <span className="card-stat">
              <i className="pi pi-headphones" />
              <Badge value={songsCount} />
            </span>
            <span className="card-stat">
              <i className="pi pi-users" />
              <Badge value={collaboratorsCount} />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
