import { useState } from "react";
import { Button } from "primereact/button";
import { useGetPlaylists } from "./hooks/useGetPlaylists.ts";
import PlaylistCard from "../../shared/components/PlaylistCard.tsx";
import CreatePlaylistDialog from "./CreatePlaylistDialog.tsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

export default function PlaylistsPage() {
  const { data: playlists, loading, error, refetch } = useGetPlaylists();
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
          label="Add New Playlist"
          className="w-15rem"
          icon="pi pi-plus"
          onClick={() => setVisibleDialog(true)}
        />

        <div className="flex flex-wrap gap-4 justify-content-center w-full">
          {(playlists ?? []).map((p) => (
            <PlaylistCard key={`playlist${p.id}`} playlist={p} />
          ))}
          {!loading && !error && playlists?.length === 0 && (
            <div className="text-empty">No public playlists found.</div>
          )}
        </div>
      </div>

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
