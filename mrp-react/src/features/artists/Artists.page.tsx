import { useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import CreateArtistDialog from "./CreateArtistDialog.tsx";
import { useGetArtists } from "./hooks/useGetArtists.ts";
import ArtistCard from "../../shared/components/ArtistCard.tsx";

export default function ArtistsPage() {
  const { artists, loading, error, refetch } = useGetArtists();
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
      <div className="artists-page">
        <Button
          label="Add New Artist"
          icon="pi pi-plus"
          onClick={() => setVisibleDialog(true)}
          className="artists-page__add-btn"
        />

        {artists.length > 0 ? (
          <div className="artists-grid">
            {artists.map((artist) => (
              <ArtistCard key={`artist${artist.id}`} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="text-empty">No artists found.</div>
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
