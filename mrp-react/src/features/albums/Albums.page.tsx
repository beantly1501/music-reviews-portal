import { useState } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";

import { useGetAlbums } from "./hooks/useGetAlbums";
import CreateAlbumDialog from "./CreateAlbumDialog";
import AlbumCard from "../../shared/components/AlbumCard.tsx";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { UserRoleEnum } from "@shared/utils";

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
  } = useGetAlbums({ page: 0, size: 20 });
  const { user } = useCurrentUser();

  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    if (typeof e.page === "number") setPage(e.page);
    if (typeof e.rows === "number") setSize(e.rows);
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
        {user?.role === UserRoleEnum.ADMIN && (
          <Button
            label="Add New Album"
            icon="pi pi-plus"
            className="w-[15rem]"
            onClick={() => setVisibleDialog(true)}
          />
        )}

        {albums.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4 justify-center w-full">
              {albums.map((album) => (
                <AlbumCard
                  key={`album${album.id}`}
                  album={album}
                  refetch={refetch}
                />
              ))}
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

            {loading && albums.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <ProgressSpinner style={{ width: 24, height: 24 }} />
                <span className="text-gray-500">Loading page…</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-[#6b7280] text-[0.95rem]">No albums found.</div>
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
