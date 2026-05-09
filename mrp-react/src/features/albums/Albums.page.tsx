import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

import { useGetAlbums } from "./hooks/useGetAlbums";
import CreateAlbumDialog from "./CreateAlbumDialog";
import AlbumCard from "../../shared/components/AlbumCard.tsx";
import AlbumFilterPanel from "./AlbumFilterPanel.tsx";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { UserRoleEnum } from "@shared/utils";

export default function AlbumsPage() {
  const {
    albums,
    loading,
    loadingMore,
    error,
    refetch,
    search,
    filters,
    hasActiveFilters,
    onSearchChange,
    onFiltersChange,
    clearSearch,
    clearFilters,
    hasMore,
    loadMore,
  } = useGetAlbums();
  const { user } = useCurrentUser();
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

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
        <div className="w-full flex items-center justify-center gap-3">
          {user?.role === UserRoleEnum.ADMIN && (
            <Button
              label="Add New Album"
              icon="pi pi-plus"
              className="w-[15rem] shrink-0"
              onClick={() => setVisibleDialog(true)}
            />
          )}

          <div className="flex gap-2 w-full max-w-md">
            <IconField iconPosition="left" className="flex-1">
              <InputIcon className="pi pi-search" />
              <InputText
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search albums…"
                className="w-full"
              />
            </IconField>
            {search.length > 0 && (
              <Button
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={clearSearch}
                aria-label="Clear search"
              />
            )}
            <AlbumFilterPanel
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onChange={onFiltersChange}
              onClear={clearFilters}
            />
          </div>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
            <ProgressSpinner />
            <div className="text-[#6b7280] text-[0.95rem]">Loading…</div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 justify-center w-full">
              {albums.map((album) => (
                <AlbumCard key={`album${album.id}`} album={album} refetch={refetch} />
              ))}

              {albums.length === 0 && (
                <div className="text-[#6b7280] text-[0.95rem]">No albums found.</div>
              )}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="w-full flex justify-center py-6">
                {loadingMore && <ProgressSpinner style={{ width: "2rem", height: "2rem" }} />}
              </div>
            )}
          </>
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
