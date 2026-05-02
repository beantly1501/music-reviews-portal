import { useMemo, useState } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { PlaylistType, ReviewResponse, useLogout } from "@shared/utils";
import { UserInfo } from "./UserInfo.tsx";
import { useGetMyReviews } from "./hooks/useGetMyReviews.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetMyPlaylists } from "../playlists/hooks/useGetMyPlaylists.ts";
import { useNavigate } from "react-router-dom";

type Row = ReviewResponse & { name: string };

export default function MyProfilePage() {
  const logout = useLogout();
  const navigate = useNavigate();

  const {
    user,
    loading: userLoading,
    error: userError,
    refresh: refreshUser,
  } = useCurrentUser();

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refresh: refreshRatings,
  } = useGetMyReviews();

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
  } = useGetMyPlaylists({ page: 0, size: 20 });

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
    if (typeof e.page === "number") setPage(e.page);
    if (typeof e.rows === "number") setSize(e.rows);
  };

  if (userLoading || reviewsLoading) return <div>Loading...</div>;

  if (!user || userError) {
    return (
      <div>
        <div>Error: {userError}</div>
        <Button onClick={refreshUser}>Retry</Button>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div>
        <div>Error loading reviews: {reviewsError}</div>
        <Button onClick={refreshRatings}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <UserInfo user={user} logout={logout} />

      <div>
        <h1>My reviews</h1>
        <DataTable
          value={tableData}
          rowHover
          stripedRows
          removableSort
          emptyMessage="You currently have no reviews."
          onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
          rowClassName={() => ({ "cursor-pointer": true })}
        >
          <Column
            field="name"
            header="Name"
            body={(row: Row) => row.name}
            sortable
          />
          <Column
            field="type"
            header="Type"
            body={(row: Row) => (
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
            body={(row: Row) => (
              <Rating value={row.grade} cancel={false} readOnly />
            )}
            sortable
          />
          <Column field="description" header="Description" />
          <Column
            field="creationDate"
            header="Creation Date"
            body={(row: Row) =>
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

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h1 className="m-0 mb-3">My playlists</h1>
          <div className="text-gray-500">{totalElements} total</div>
        </div>

        {playlistsError && (
          <div className="my-3 flex items-center gap-2">
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
          emptyMessage="You currently have no playlists."
          rowHover
          stripedRows
          removableSort
          onRowClick={(row) => navigate(`/playlist/${row.data.id}`)}
        >
          <Column
            header="Name"
            body={(row: PlaylistType) => (
              <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 mt-3">
            <ProgressSpinner style={{ width: 24, height: 24 }} />
            <span className="text-gray-500">Loading page…</span>
          </div>
        )}
      </div>
    </div>
  );
}
