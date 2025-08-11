import { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

import { ReviewResponse, useLogout } from "@shared/utils";
import { ProfileInfo } from "./ProfileInfo";
import { useGetMyReviews } from "./hooks/useGetMyReviews.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";

type Row = ReviewResponse & { name: string };

export default function ProfilePage() {
  const logout = useLogout();

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

  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();
  const [selectedReviewType, setSelectedReviewType] = useState<
    "SONG" | "ALBUM" | undefined
  >();

  // Derive a consistent "name" field so sorting/filtering works
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
    <div>
      <ProfileInfo user={user} logout={logout} />

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
          key={selectedReviewId} // force remount when a different row is clicked
          visible={dialogVisible}
          onHide={closeDialog}
          reviewId={selectedReviewId}
          reviewType={selectedReviewType}
          refetch={refreshRatings} // refresh list after edit/delete
        />
      )}
    </div>
  );
}
