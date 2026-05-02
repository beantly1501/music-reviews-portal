import { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetAllReviews } from "./hooks/useGetAllReviews";
import { ReviewResponse } from "@shared/utils";

export default function AllReviewsPage() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();
  const [selectedReviewType, setSelectedReviewType] = useState<
    "SONG" | "ALBUM" | undefined
  >();

  const { reviews, loading, error, refetch } = useGetAllReviews();

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

  const tableData: ReviewResponse[] = useMemo(
    () =>
      (reviews ?? []).map((r) => ({
        ...r,
        name: r.type === "SONG" ? (r.songName ?? "") : (r.albumName ?? ""),
      })),
    [reviews],
  );

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
    <div>
      <h1>All Reviews</h1>

      <DataTable
        value={tableData}
        rowHover
        stripedRows
        removableSort
        onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
        rowClassName={() => ({ "cursor-pointer": true })}
        emptyMessage="There are currently no reviews."
      >
        <Column
          field="name"
          header="Name"
          body={(row) => (row.type === "SONG" ? row.songName : row.albumName)}
          sortable
        />
        <Column
          field="type"
          header="Type"
          body={(row) => (
            <Tag
              value={row.type === "SONG" ? "Song" : "Album"}
              severity={row.type === "SONG" ? "success" : "info"}
            />
          )}
          sortable
        />
        <Column
          field="username"
          header="Username"
          body={(row) => <strong>{row.username}</strong>}
          sortable
        />
        <Column
          field="grade"
          header="Rating"
          body={(row) => <Rating value={row.grade} cancel={false} readOnly />}
          sortable
        />
        <Column field="description" header="Description" />
        <Column
          field="creationDate"
          header="Last updated"
          body={(row) => new Date(row.creationDate).toLocaleDateString("hr-HR")}
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
          refetch={refetch}
        />
      )}
    </div>
  );
}
