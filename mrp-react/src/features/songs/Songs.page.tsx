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
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <Message severity="error" text={`Error: ${error}`} />
        <Button label="Retry" icon="pi pi-refresh" onClick={refetch} className="mt-1" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4">
        {user?.role === UserRoleEnum.ADMIN && (
          <Button
            label="Add New Song"
            icon="pi pi-plus"
            className="w-[15rem]"
            onClick={() => setVisibleDialog(true)}
          />
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {songs.map((song) => (
            <SongCard key={`song${song.id}`} song={song} refetch={refetch} />
          ))}

          {!loading && !error && songs.length === 0 && (
            <div className="text-[#6b7280] text-[0.95rem]">No songs found.</div>
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
