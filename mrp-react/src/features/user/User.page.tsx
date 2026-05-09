import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable, DataTableFilterMeta, DataTablePageEvent } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { FilterMatchMode } from "primereact/api";

import { PlaylistType, ReviewResponse } from "@shared/utils";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetPublicPlaylists } from "../../shared/hooks/useGetPublicPlaylists.ts";
import { useGetUserReviews } from "../../shared/hooks/useGetUserReviews.ts";
import { useGetUserById } from "../../shared/hooks/useGetUserById.ts";
import { UserInfo } from "./UserInfo.tsx";

const TYPE_OPTIONS = [
  { label: "Song", value: "SONG" },
  { label: "Album", value: "ALBUM" },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }));

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
  const [selectedReviewId, setSelectedReviewId] = useState<number | undefined>();
  const [selectedReviewType, setSelectedReviewType] = useState<"SONG" | "ALBUM" | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showPlaylistFilters, setShowPlaylistFilters] = useState(false);
  const [playlistFilters, setPlaylistFilters] = useState<DataTableFilterMeta>({
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    isPrivate: { value: null, matchMode: FilterMatchMode.IN },
    ownerUsername: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.IN },
    grade: { value: null, matchMode: FilterMatchMode.IN },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    creationDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  });

  const tableData = useMemo(
    () =>
      (reviews ?? []).map((r) => ({
        ...r,
        name: r.type === "SONG" ? (r.songName ?? "") : (r.albumName ?? ""),
        creationDate: r.creationDate ? new Date(r.creationDate) : null,
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

  const typeItemTemplate = (option: { label: string; value: string }) => (
    <Tag value={option.label} severity={option.value === "SONG" ? "success" : "info"} />
  );

  const typeSelectedItemTemplate = (value: string) => {
    const option = TYPE_OPTIONS.find((o) => o.value === value);
    if (!option) return null;
    return <Tag value={option.label} severity={option.value === "SONG" ? "success" : "info"} />;
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
      panelStyle={{ width: "400px" }}
    />
  );

  const VISIBILITY_OPTIONS = [
    { label: "Public", value: false },
    { label: "Private", value: true },
  ];

  const visibilityItemTemplate = (option: { label: string; value: boolean }) => (
    <Tag value={option.label} severity={option.value ? "danger" : "success"} />
  );

  const visibilitySelectedItemTemplate = (value: boolean) => {
    const option = VISIBILITY_OPTIONS.find((o) => o.value === value);
    if (!option) return null;
    return <Tag value={option.label} severity={option.value ? "danger" : "success"} />;
  };

  const visibilityFilterTemplate = (options: ColumnFilterElementTemplateOptions) => (
    <MultiSelect
      value={options.value}
      options={VISIBILITY_OPTIONS}
      onChange={(e) => options.filterApplyCallback(e.value)}
      itemTemplate={visibilityItemTemplate}
      selectedItemTemplate={visibilitySelectedItemTemplate}
      placeholder="Any"
      className="w-full"
      maxSelectedLabels={2}
    />
  );

  const loadingAny = userLoading || playlistsLoading || reviewsLoading;

  if (!userIdParam || Number.isNaN(userId)) {
    return <div className="p-4">No user specified.</div>;
  }

  if (loadingAny && totalElements === 0 && (!reviews || reviews.length === 0)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <UserInfo user={viewedUser} />
        <Button
          label="Back"
          className="mb-auto"
          icon="pi pi-arrow-left"
          onClick={() => navigate(-1)}
          outlined
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="m-0">{viewedUser?.username}'s Reviews</h2>
          <div className="flex items-center gap-2">
            {reviewsError && (
              <Message severity="error" text={`Error loading reviews: ${reviewsError}`} />
            )}
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
          emptyMessage={`${viewedUser?.username} has no reviews yet.`}
          onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
          rowClassName={() => ({ "cursor-pointer": true })}
          loading={reviewsLoading}
        >
          <Column
            field="name"
            header="Name"
            body={(row: ReviewResponse & { name: string }) => row.name}
            sortable
            filter
            filterPlaceholder="Filter name"
            showFilterMenu={false}
          />
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
            filter
            filterElement={typeFilterTemplate}
            showFilterMenu={false}
          />
          <Column
            field="grade"
            header="Rating"
            body={(row: ReviewResponse) => <Rating value={row.grade} cancel={false} readOnly />}
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
            header="Creation Date"
            body={(row: ReviewResponse) =>
              row.creationDate ? new Date(row.creationDate).toLocaleDateString("hr-HR") : ""
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
            refetch={refreshRatings}
          />
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="m-0">
            {viewedUser && `${viewedUser.username}'s public playlists`}
          </h2>
          <Button
            icon={`pi pi-filter${showPlaylistFilters ? "-slash" : ""}`}
            outlined
            onClick={() => setShowPlaylistFilters((prev) => !prev)}
            tooltip={showPlaylistFilters ? "Hide filters" : "Show filters"}
            tooltipOptions={{ position: "left" }}
          />
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
          filters={playlistFilters}
          onFilter={(e) => setPlaylistFilters(e.filters as DataTableFilterMeta)}
          filterDisplay={showPlaylistFilters ? "row" : undefined}
          emptyMessage={`${viewedUser ? viewedUser.username : `User #${userId}`} has no public playlists.`}
          rowHover
          stripedRows
          removableSort
          onRowClick={(row) => navigate(`/playlist/${row.data.id}`)}
        >
          <Column
            field="name"
            header="Name"
            body={(row: PlaylistType) => (
              <div className="flex items-center gap-3">
                <span className="font-medium">{row.name}</span>
              </div>
            )}
            sortable
            filter
            filterPlaceholder="Filter name"
            showFilterMenu={false}
          />
          <Column
            field="isPrivate"
            header="Visibility"
            body={(row: PlaylistType) => (
              <Tag
                value={row.isPrivate ? "Private" : "Public"}
                severity={row.isPrivate ? "danger" : "success"}
              />
            )}
            sortable
            filter
            filterElement={visibilityFilterTemplate}
            showFilterMenu={false}
          />
          <Column
            field="ownerUsername"
            header="Owner"
            sortable
            filter
            filterPlaceholder="Filter owner"
            showFilterMenu={false}
          />
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
          <Column
            field="description"
            header="Description"
            filter
            filterPlaceholder="Filter description"
            showFilterMenu={false}
          />
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
