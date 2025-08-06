import { useState } from "react";
import { Button } from "primereact/button";
import { useGetAlbums } from "./hooks/useGetAlbums";
import CreateAlbumDialog from "./CreateAlbumDialog";
import AlbumCard from "../../shared/components/AlbumCard.tsx";

export default function AlbumsPage() {
  const { albums, loading, error, refetch } = useGetAlbums();
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-column justify-content-center align-items-center gap-4 p-4">
        <Button
          label="Add New Album"
          className="w-12rem"
          onClick={() => setVisibleDialog(true)}
        />

        {loading && <div>Loading albums...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        {!loading && !error && albums.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-content-center">
            {albums.map((album) => (
              <AlbumCard album={album} refetch={refetch} />
            ))}
          </div>
        )}

        {!loading && !error && albums.length === 0 && (
          <div>No albums found.</div>
        )}
      </div>

      <CreateAlbumDialog
        visible={visibleDialog}
        setVisible={setVisibleDialog}
        onCreated={refetch}
      />
    </>
  );
}
