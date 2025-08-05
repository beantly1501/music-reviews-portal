import { useGetSongs } from "./hooks/useGetSongs.tsx";
import { Button } from "primereact/button";
import CreateSongDialog from "../../shared/components/CreateSongDialog.tsx";
import { useState } from "react";
import SongCard from "../../shared/components/SongCard.tsx";

export default function SongsPage() {
  const { songs, loading, error, refetch } = useGetSongs();

  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="flex flex-column justify-content-center align-items-center gap-4">
        <Button
          label="Add New Song"
          className="w-10rem"
          onClick={() => setVisibleDialog(true)}
        />
        <div className="flex flex flex-wrap gap-4 justify-content-center">
          {songs.map((song) => (
            <SongCard song={song} />
          ))}
        </div>
      </div>
      <CreateSongDialog
        visible={visibleDialog}
        setVisible={setVisibleDialog}
        onCreated={refetch}
      />
    </>
  );
}
