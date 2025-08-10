import { useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { useGetAlbums } from "./hooks/useGetAlbums";
import CreateAlbumDialog from "./CreateAlbumDialog";
import AlbumCard from "../../shared/components/AlbumCard.tsx";

export default function AlbumsPage() {
  const { albums, loading, error, refetch } = useGetAlbums();
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="page-status">
        <ProgressSpinner />
        <div className="page-status__text">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-status">
        <Message severity="error" text={`Error: ${error}`} />
        <Button
          label="Retry"
          icon="pi pi-refresh"
          onClick={refetch}
          className="page-status__action"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-column justify-content-center align-items-center gap-4">
        <Button
          label="Add New Album"
          icon="pi pi-plus"
          className="w-15rem"
          onClick={() => setVisibleDialog(true)}
        />

        {albums.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-content-center">
            {albums.map((album) => (
              <AlbumCard
                key={`album${album.id}`}
                album={album}
                refetch={refetch}
              />
            ))}
          </div>
        ) : (
          <div className="text-empty">No albums found.</div>
        )}
      </div>

      {visibleDialog && (
        <CreateAlbumDialog
          visible={visibleDialog}
          setVisible={setVisibleDialog}
          onCreated={refetch}
        />
      )}
    </>
  );
}
