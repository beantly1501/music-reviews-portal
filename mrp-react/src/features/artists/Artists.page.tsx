import { useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import CreateArtistDialog from "./CreateArtistDialog.tsx";
import { useGetArtists } from "./hooks/useGetArtists.ts";
import ArtistCard from "../../shared/components/ArtistCard.tsx";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { UserRoleEnum } from "@shared/utils";

export default function ArtistsPage() {
  const { artists, loading, error, refetch } = useGetArtists();
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
      <div className="flex flex-col items-center gap-4">
        {user?.role === UserRoleEnum.ADMIN && (
          <Button
            label="Add New Artist"
            icon="pi pi-plus"
            onClick={() => setVisibleDialog(true)}
            className="w-[15rem]"
          />
        )}

        {artists.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center">
            {artists.map((artist) => (
              <ArtistCard key={`artist${artist.id}`} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="text-[#6b7280] text-[0.95rem]">No artists found.</div>
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
