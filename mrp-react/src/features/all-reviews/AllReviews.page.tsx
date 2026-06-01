import { useMemo, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode } from "primereact/api";

import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetAllReviews } from "./hooks/useGetAllReviews";
import { ReviewResponse } from "@shared/utils";

const TYPE_OPTIONS = [
  { label: "Song", value: "SONG" },
  { label: "Album", value: "ALBUM" },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  label: String(n),
  value: n,
}));

export default function AllReviewsPage() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();
  const [selectedReviewType, setSelectedReviewType] = useState<
    "SONG" | "ALBUM" | undefined
  >();
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.IN },
    username: { value: null, matchMode: FilterMatchMode.CONTAINS },
    grade: { value: null, matchMode: FilterMatchMode.IN },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    creationDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const tableData = useMemo(
    () =>
      (reviews ?? []).map((r) => ({
        ...r,
        name: r.type === "SONG" ? (r.songName ?? "") : (r.albumName ?? ""),
        creationDate: r.creationDate ? new Date(r.creationDate) : null,
      })),
    [reviews],
  );

  const typeItemTemplate = (option: { label: string; value: string }) => (
    <Tag
      value={option.label}
      severity={option.value === "SONG" ? "success" : "info"}
    />
  );

  const typeSelectedItemTemplate = (value: string) => {
    const option = TYPE_OPTIONS.find((o) => o.value === value);
    if (!option) return null;
    return (
      <Tag
        value={option.label}
        severity={option.value === "SONG" ? "success" : "info"}
      />
    );
  };

  const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => (
    <MultiSelect
      value={options.value}
      options={TYPE_OPTIONS}
      onChange={(e) => options.filterApplyCallback(e.value)}
      itemTemplate={typeItemTemplate}
      selectedItemTemplate={typeSelectedItemTemplate}
      placeholder="Any"
      className="w-full"
      maxSelectedLabels={2}
    />
  );

  const gradeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => (
    <MultiSelect
      value={options.value}
      options={GRADE_OPTIONS}
      onChange={(e) => options.filterApplyCallback(e.value)}
      placeholder="Any"
      className="w-full"
      maxSelectedLabels={3}
    />
  );

  const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterApplyCallback(e.value)}
      selectionMode="range"
      readOnlyInput
      placeholder="Filter date"
      dateFormat="dd.mm.yy"
      showButtonBar
      className="w-full"
    />
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
        <Button
          label="Retry"
          icon="pi pi-refresh"
          onClick={refetch}
          className="mt-1"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-bold text-2xl">All Reviews</h1>
        <div className="flex items-center gap-2">
          <div className="text-gray-500">{tableData.length} total</div>
          <Button
            icon={`pi pi-filter${showFilters ? "-slash" : ""}`}
            outlined
            onClick={() => setShowFilters((prev) => !prev)}
            tooltip={showFilters ? "Hide filters" : "Show filters"}
            tooltipOptions={{ position: "left" }}
          />
        </div>
      </div>

      <DataTable
        value={tableData}
        rowHover
        stripedRows
        removableSort
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
        filters={filters}
        onFilter={(e) => setFilters(e.filters as DataTableFilterMeta)}
        filterDisplay={showFilters ? "row" : undefined}
        onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
        rowClassName={() => ({ "cursor-pointer": true })}
        emptyMessage="There are currently no reviews."
      >
        <Column
          field="name"
          header="Name"
          body={(row) => (row.type === "SONG" ? row.songName : row.albumName)}
          sortable
          filter
          filterPlaceholder="Filter name"
          showFilterMenu={false}
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
          filter
          filterElement={typeFilterTemplate}
          showFilterMenu={false}
        />
        <Column
          field="username"
          header="Username"
          body={(row) => <strong>{row.username}</strong>}
          sortable
          filter
          filterPlaceholder="Filter user"
          showFilterMenu={false}
        />
        <Column
          field="grade"
          header="Rating"
          body={(row) => <Rating value={row.grade} cancel={false} readOnly />}
          sortable
          filter
          filterElement={gradeFilterTemplate}
          showFilterMenu={false}
          dataType="numeric"
        />
        <Column
          field="description"
          header="Description"
          filter
          filterPlaceholder="Filter description"
          showFilterMenu={false}
        />
        <Column
          field="creationDate"
          header="Last updated"
          body={(row) =>
            row.creationDate
              ? new Date(row.creationDate).toLocaleDateString("hr-HR")
              : ""
          }
          sortable
          filter
          filterElement={dateFilterTemplate}
          showFilterMenu={false}
          dataType="date"
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
