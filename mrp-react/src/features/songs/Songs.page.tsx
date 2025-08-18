import { useGetSongs } from "./hooks/useGetSongs.tsx";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import CreateSongDialog from "./CreateSongDialog.tsx";
import { useState } from "react";
import SongCard from "../../shared/components/SongCard.tsx";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { UserRoleEnum } from "@shared/utils";

export default function SongsPage() {
  const { songs, loading, error, refetch } = useGetSongs();
  const { user } = useCurrentUser();
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
        {user?.role === UserRoleEnum.ADMIN && (
          <Button
            label="Add New Song"
            icon="pi pi-plus"
            className="w-15rem"
            onClick={() => setVisibleDialog(true)}
          />
        )}
        <div className="flex flex flex-wrap gap-4 justify-content-center">
          {songs.map((song) => (
            <SongCard key={`song${song.id}`} song={song} refetch={refetch} />
          ))}

          {!loading && !error && songs.length === 0 && (
            <div className="text-empty">No songs found.</div>
          )}
        </div>
      </div>

      {visibleDialog && (
        <CreateSongDialog
          visible={visibleDialog}
          setVisible={setVisibleDialog}
          onCreated={refetch}
        />
      )}
    </>
  );
}
