// src/pages/songs/SongDetailsPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  DataTable,
  DataTablePageEvent,
  DataTableStateEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";

import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetSong } from "../../shared/hooks/useGetSong.ts";
import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { useGetSongReviews } from "../../shared/hooks/useGetSongReviews.ts";
import { GenreType, ReviewResponse } from "@shared/utils";

export default function SongDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const songId = useMemo(() => (id ? Number(id) : undefined), [id]);

  // Song details
  const { song, loading: loadingSong, error: songError } = useGetSong(songId);

  // Song cover
  const {
    loading: loadingCover,
    exists: coverExists,
    image: coverSrc,
  } = useGetImage(songId ? `/api/images/song/${songId}` : undefined);

  // Pageable/Sortable song reviews
  const {
    reviews,
    total,
    page,
    rows,
    loading: loadingReviews,
    error: reviewsError,
    sortField,
    sortOrder,
    onPage,
    onSort,
    refresh,
  } = useGetSongReviews(songId);

  // Review dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();

  const openDialog = (row: ReviewResponse) => {
    setSelectedReviewId(row.id);
    setDialogVisible(true);
  };
  const closeDialog = () => setDialogVisible(false);

  // ---- Adapters to satisfy PrimeReact types (fixes TS2322) ----
  const handlePage = (e: DataTablePageEvent) => {
    onPage({ first: e.first, rows: e.rows, page: e.page });
  };

  const handleSort = (e: DataTableStateEvent) => {
    // PrimeReact can emit sortOrder as 1 | 0 | -1 | null | undefined
    const normalized: 1 | -1 | undefined =
      e.sortOrder === 1 ? 1 : e.sortOrder === -1 ? -1 : undefined;

    onSort({
      sortField: e.sortField ?? undefined,
      sortOrder: normalized,
    });
  };
  // -------------------------------------------------------------

  if (!songId) {
    return <Message severity="error" text="Invalid song id." />;
  }

  if (loadingSong) {
    return (
      <div className="page-status">
        <ProgressSpinner />
        <div className="page-status__text">Loading song…</div>
      </div>
    );
  }

  if (songError || !song) {
    return <Message severity="error" text={songError ?? "Song not found."} />;
  }

  return (
    <div className="song-details-page p-3">
      <div className="flex justify-content-end mb-3">
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          onClick={() => navigate(-1)}
          severity="secondary"
          outlined
        />
      </div>

      {/* Song Card */}
      <Card
        className="p-shadow-2"
        style={{ overflow: "hidden", borderRadius: 12 }}
      >
        <div className="flex gap-4 flex-column md:flex-row">
          <div style={{ width: 300, maxWidth: "100%" }}>
            <Image
              src={
                !loadingCover && coverExists
                  ? (coverSrc ?? undefined)
                  : undefined
              }
              alt={song.name}
              imageClassName="w-full"
              imageStyle={{ height: 280, objectFit: "cover" }}
            />
          </div>

          <div className="flex-1">
            <div className="text-2xl font-semibold mb-2">{song.name}</div>

            {song.year ? (
              <div className="text-color-secondary mb-2">
                Released {song.year}
              </div>
            ) : null}

            {/* Genres */}
            {Array.isArray(song.genres) && song.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {song.genres.map((g: GenreType) => (
                  <Chip
                    key={g.id ?? g.name}
                    label={g.name}
                    className="rdialog__tag"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {song.link && (
                <Button
                  label="Open Song Link"
                  icon="pi pi-external-link"
                  onClick={() => window.open(song.link, "_blank")}
                />
              )}
            </div>
          </div>
        </div>
      </Card>

      <Divider />

      <Card>
        {/* Reviews Table */}
        <div className="flex align-items-center justify-content-between mb-2">
          <h2 className="m-0">Reviews</h2>
          {reviewsError && <Message severity="error" text={reviewsError} />}
        </div>

        <DataTable
          value={reviews}
          rowHover
          stripedRows
          removableSort
          sortMode="multiple"
          paginator
          lazy
          totalRecords={total}
          rows={rows}
          first={page * rows}
          loading={loadingReviews}
          emptyMessage="No reviews for this song yet."
          onPage={handlePage}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder as 1 | 0 | -1 | null | undefined}
          onRowClick={(e) => openDialog(e.data as ReviewResponse)}
          rowClassName={() => ({ "cursor-pointer": true })}
        >
          <Column
            field="username"
            header="Reviewer"
            body={(row: ReviewResponse) => <strong>{row.username}</strong>}
            sortable
          />
          <Column
            field="grade"
            header="Rating"
            body={(row: ReviewResponse) => (
              <Rating value={row.grade} readOnly cancel={false} />
            )}
            sortable
          />
          <Column field="description" header="Description" />
          <Column
            field="creationDate"
            header="Created"
            body={(row: ReviewResponse) =>
              new Date(row.creationDate).toLocaleDateString("hr-HR")
            }
            sortable
          />
          <Column
            header="Type"
            body={() => <Tag value="Song" severity="success" />}
          />
        </DataTable>
      </Card>

      {/* Review dialog */}
      {dialogVisible && selectedReviewId !== undefined && (
        <ReviewDialog
          key={selectedReviewId} // force remount per selection
          visible={dialogVisible}
          onHide={closeDialog}
          reviewId={selectedReviewId}
          reviewType="SONG"
          refetch={refresh} // refresh current page after edit/delete
        />
      )}
    </div>
  );
}
