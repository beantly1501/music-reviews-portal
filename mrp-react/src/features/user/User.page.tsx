import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { PlaylistType, ReviewResponse } from "@shared/utils";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetPublicPlaylists } from "../../shared/hooks/useGetPublicPlaylists.ts";
import { useGetUserReviews } from "../../shared/hooks/useGetUserReviews.ts";
import { useGetUserById } from "../../shared/hooks/useGetUserById.ts";
import { UserInfo } from "./UserInfo.tsx";

export default function UserPage() {
  const { id: userIdParam } = useParams();
  const userId = userIdParam ? Number(userIdParam) : NaN;
  const navigate = useNavigate();

  const { user: viewedUser, loading: userLoading } = useGetUserById(userId);

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refreshRatings,
  } = useGetUserReviews(userId);

  // public playlists for this user (server-side pageable)
  const {
    data: playlists,
    loading: playlistsLoading,
    error: playlistsError,
    page,
    size,
    totalElements,
    setPage,
    setSize,
    refetch: refetchPlaylists,
  } = useGetPublicPlaylists({ page: 0, size: 20, userId });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();
  const [selectedReviewType, setSelectedReviewType] = useState<
    "SONG" | "ALBUM" | undefined
  >();

  const tableData: ReviewResponse[] = useMemo(
    () =>
      (reviews ?? []).map((r) => ({
        ...r,
        name: r.type === "SONG" ? (r.songName ?? "") : (r.albumName ?? ""),
      })),
    [reviews],
  );

  const openDialogForRow = (row: ReviewResponse) => {
    setSelectedReviewId(row.id);
    setSelectedReviewType(row.type);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedReviewId(undefined);
    setSelectedReviewType(undefined);
  };

  const onPlaylistsPage = (e: DataTablePageEvent) => {
    if (typeof e.page === "number") setPage(e.page); // 0-based
    if (typeof e.rows === "number") setSize(e.rows);
  };

  const loadingAny = userLoading || playlistsLoading || reviewsLoading;

  if (!userIdParam || Number.isNaN(userId)) {
    return <div className="p-4">No user specified.</div>;
  }

  if (loadingAny && totalElements === 0 && (!reviews || reviews.length === 0)) {
    return (
      <div className="page-status">
        <ProgressSpinner />
        <div className="page-status__text">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-4">
      {/* Header for the viewed user */}
      <div className="flex align-items-center justify-content-end">
        <UserInfo user={viewedUser} />
        <Button
          label="Back"
          className="mb-auto"
          icon="pi pi-arrow-left"
          onClick={() => navigate(-1)}
          outlined
        />
      </div>

      {/* Reviews */}
      <div>
        <div className="flex align-items-center justify-content-between">
          <h2 className="m-0 mb-3">{viewedUser?.username}'s Reviews</h2>
          {reviewsError && (
            <div className="my-2">
              <Message
                severity="error"
                text={`Error loading reviews: ${reviewsError}`}
              />
            </div>
          )}
        </div>

        <DataTable
          value={tableData}
          rowHover
          stripedRows
          removableSort
          emptyMessage={`${viewedUser?.username} has no reviews yet.`}
          onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
          rowClassName={() => ({ "cursor-pointer": true })}
          loading={reviewsLoading}
        >
          <Column
            field="type"
            header="Type"
            body={(row: ReviewResponse) => (
              <Tag
                value={row.type === "SONG" ? "Song" : "Album"}
                severity={row.type === "SONG" ? "success" : "info"}
              />
            )}
            sortable
          />
          <Column
            field="grade"
            header="Rating"
            body={(row: ReviewResponse) => (
              <Rating value={row.grade} cancel={false} readOnly />
            )}
            sortable
          />
          <Column field="description" header="Description" />
          <Column
            field="creationDate"
            header="Creation Date"
            body={(row: ReviewResponse) =>
              new Date(row.creationDate).toLocaleDateString("hr-HR")
            }
            sortable
          />
        </DataTable>

        {dialogVisible && selectedReviewId !== undefined && (
          <ReviewDialog
            key={selectedReviewId}
            visible={dialogVisible}
            onHide={closeDialog}
            reviewId={selectedReviewId}
            reviewType={selectedReviewType}
            refetch={refreshRatings}
          />
        )}
      </div>

      {/* Public Playlists */}
      <div className="mt-5">
        <div className="flex align-items-center justify-content-between">
          <h2 className="m-0 mb-3">
            {viewedUser && `${viewedUser.username}'s public playlists`}
          </h2>
        </div>

        {playlistsError && (
          <div className="my-3 flex align-items-center gap-2">
            <Message severity="error" text={`Error: ${playlistsError}`} />
            <Button
              label="Retry"
              icon="pi pi-refresh"
              onClick={refetchPlaylists}
            />
          </div>
        )}

        <DataTable
          value={playlists ?? []}
          lazy
          paginator
          rows={size}
          first={page * size}
          totalRecords={totalElements}
          onPage={onPlaylistsPage}
          rowsPerPageOptions={[10, 20, 50]}
          loading={playlistsLoading}
          emptyMessage={`${viewedUser ? viewedUser.username : `User #${userId}`} has no public playlists.`}
          rowHover
          stripedRows
          removableSort
          onRowClick={(row) => navigate(`/playlist/${row.data.id}`)}
        >
          <Column
            header="Name"
            body={(row: PlaylistType) => (
              <div className="flex align-items-center gap-3">
                <span className="font-medium">{row.name}</span>
              </div>
            )}
            sortable
          />
          <Column
            header="Visibility"
            body={(row: PlaylistType) => (
              <Tag
                value={row.isPrivate ? "Private" : "Public"}
                severity={row.isPrivate ? "danger" : "success"}
              />
            )}
            sortable
          />
          <Column field="ownerUsername" header="Owner" sortable />
          <Column
            header="Songs"
            body={(row: PlaylistType) => row.songs?.length ?? 0}
            sortable
          />
          <Column
            header="Collaborators"
            body={(row: PlaylistType) => row.collaborators?.length ?? 0}
            sortable
          />
          <Column field="description" header="Description" />
        </DataTable>

        {playlistsLoading && (playlists?.length ?? 0) > 0 && (
          <div className="flex align-items-center gap-2 mt-3">
            <ProgressSpinner style={{ width: 24, height: 24 }} />
            <span className="text-500">Loading page…</span>
          </div>
        )}
      </div>
    </div>
  );
}
