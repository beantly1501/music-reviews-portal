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
      <div className="flex flex-col justify-center items-center gap-4 w-full">
        <div className="flex gap-3 items-center">
          <Button
            label="Add New Playlist"
            className="w-[15rem]"
            icon="pi pi-plus"
            onClick={() => setVisibleDialog(true)}
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-center w-full">
          {(playlists ?? []).map((p) => (
            <PlaylistCard key={`playlist${p.id}`} playlist={p} />
          ))}
          {!loading && !error && totalElements === 0 && (
            <div className="text-[#6b7280] text-[0.95rem]">No public playlists found.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="w-full flex justify-center mt-4">
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
          <div className="flex items-center gap-2 mt-3">
            <ProgressSpinner style={{ width: 24, height: 24 }} />
            <span className="text-gray-500">Loading page…</span>
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
