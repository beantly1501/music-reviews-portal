import { useState } from "react";
import { Button } from "primereact/button";
import { useGetPlaylists } from "./hooks/useGetPlaylists.ts";
import PlaylistCard from "../../shared/components/PlaylistCard.tsx";
import CreatePlaylistDialog from "./CreatePlaylistDialog.tsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";

export default function PlaylistsPage() {
  const {
    data: playlists,
    loading,
    error,
    refetch,
    page,
    size,
    totalElements,
    totalPages,
    setPage,
    setSize,
  } = useGetPlaylists({
    page: 0,
    size: 20,
  });

  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    if (e.page !== page) setPage(e.page);
    if (e.rows !== size) setSize(e.rows);
  };

  if (loading && totalElements === 0) {
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
      <div className="flex flex-column justify-content-center align-items-center gap-4 w-full">
        <div className="flex gap-3 align-items-center">
          <Button
            label="Add New Playlist"
            className="w-15rem"
            icon="pi pi-plus"
            onClick={() => setVisibleDialog(true)}
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-content-center w-full">
          {(playlists ?? []).map((p) => (
            <PlaylistCard key={`playlist${p.id}`} playlist={p} />
          ))}
          {!loading && !error && totalElements === 0 && (
            <div className="text-empty">No public playlists found.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="w-full flex justify-content-center mt-4">
            <Paginator
              first={page * size}
              rows={size}
              totalRecords={totalElements}
              onPageChange={onPageChange}
              rowsPerPageOptions={[10, 20, 50]}
              pageLinkSize={5}
            />
          </div>
        )}

        {loading && totalElements > 0 && (
          <div className="flex align-items-center gap-2 mt-3">
            <ProgressSpinner style={{ width: 24, height: 24 }} />
            <span className="text-500">Loading page…</span>
          </div>
        )}
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
