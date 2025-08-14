import { useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";

import { useGetAlbums } from "./hooks/useGetAlbums";
import CreateAlbumDialog from "./CreateAlbumDialog";
import AlbumCard from "../../shared/components/AlbumCard.tsx";

export default function AlbumsPage() {
  const {
    albums,
    loading,
    error,
    refetch,
    page,
    size,
    totalElements,
    totalPages,
    setPage,
    setSize,
  } = useGetAlbums({ page: 0, size: 20 /*, sort: "id,asc" */ });

  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    if (typeof e.page === "number") setPage(e.page); // 0-based
    if (typeof e.rows === "number") setSize(e.rows);
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
        <div className="flex align-items-center gap-3">
          <Button
            label="Add New Album"
            icon="pi pi-plus"
            className="w-15rem"
            onClick={() => setVisibleDialog(true)}
          />
        </div>

        {albums.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4 justify-content-center w-full">
              {albums.map((album) => (
                <AlbumCard
                  key={`album${album.id}`}
                  album={album}
                  refetch={refetch}
                />
              ))}
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

            {loading && albums.length > 0 && (
              <div className="flex align-items-center gap-2 mt-3">
                <ProgressSpinner style={{ width: 24, height: 24 }} />
                <span className="text-500">Loading page…</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-empty">No albums found.</div>
        )}
      </div>

      {visibleDialog && (
        <CreateAlbumDialog
          visible={visibleDialog}
          setVisible={setVisibleDialog}
          onCreated={refetch}
        />
      )}
    </>
  );
}
