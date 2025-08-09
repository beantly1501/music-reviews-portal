import { useState } from "react";
import { Button } from "primereact/button";
import CreateArtistDialog from "./CreateArtistDialog.tsx";
import { useGetArtists } from "./hooks/useGetArtists.ts";
import ArtistCard from "../../shared/components/ArtistCard.tsx";

export default function ArtistsPage() {
  const { artists, loading, error, refetch } = useGetArtists();
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="flex flex-column justify-content-center align-items-center gap-4 p-4">
        <Button
          label="Add New Artist"
          className="w-12rem"
          onClick={() => setVisibleDialog(true)}
        />

        {!loading && !error && artists.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-content-center">
            {artists.map((artist) => (
              <ArtistCard artist={artist} />
            ))}
          </div>
        )}

        {!loading && !error && artists.length === 0 && (
          <div>No artists found.</div>
        )}
      </div>

      <CreateArtistDialog
        visible={visibleDialog}
        setVisible={setVisibleDialog}
        onCreated={refetch}
      />
    </>
  );
}
