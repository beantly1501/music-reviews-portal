import { useState } from "react";
import { Button } from "primereact/button";
import { useGetPlaylists } from "./hooks/useGetPlaylists.ts";
import PlaylistCard from "../../shared/components/PlaylistCard.tsx";
import CreatePlaylistDialog from "./CreatePlaylistDialog.tsx";

export default function PlaylistsPage() {
  const { data: playlists, loading, error, refetch } = useGetPlaylists();
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error ?? String(error)}</p>;

  return (
    <>
      <div className="flex flex-column justify-content-center align-items-center gap-4">
        <Button
          label="Create New Playlist"
          className="w-15rem"
          icon="pi pi-plus"
          onClick={() => setVisibleDialog(true)}
        />

        <div className="flex flex-wrap gap-4 justify-content-center w-full">
          {(playlists ?? []).map((p) => (
            <PlaylistCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      {!loading && !error && (playlists?.length ?? 0) === 0 && (
        <div>No playlists found.</div>
      )}

      {visibleDialog && (
        <CreatePlaylistDialog
          visible={visibleDialog}
          setVisible={setVisibleDialog}
          onCreated={refetch}
        />
      )}
    </>
  );
}
