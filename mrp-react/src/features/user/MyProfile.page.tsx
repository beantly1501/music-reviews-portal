import { useMemo, useState } from "react";
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

import { PlaylistType, ReviewResponse, useLogout } from "@shared/utils";
import { UserInfo } from "./UserInfo.tsx";
import { useGetMyReviews } from "./hooks/useGetMyReviews.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";
import { useGetMyPlaylists } from "../playlists/hooks/useGetMyPlaylists.ts";
import { useNavigate } from "react-router-dom";

type Row = ReviewResponse & { name: string };

const TYPE_OPTIONS = [
  { label: "Song", value: "SONG" },
  { label: "Album", value: "ALBUM" },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }));

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

  if (userLoading || reviewsLoading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading…</div>
      </div>
    );

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
        <div className="flex items-center justify-between mb-3">
          <h1 className="m-0">My reviews</h1>
          <Button
            icon={`pi pi-filter${showFilters ? "-slash" : ""}`}
            outlined
            onClick={() => setShowFilters((prev) => !prev)}
            tooltip={showFilters ? "Hide filters" : "Show filters"}
            tooltipOptions={{ position: "left" }}
          />
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
          emptyMessage="You currently have no reviews."
          onRowClick={(e) => openDialogForRow(e.data as ReviewResponse)}
          rowClassName={() => ({ "cursor-pointer": true })}
        >
          <Column
            field="name"
            header="Name"
            body={(row: Row) => row.name}
            sortable
            filter
            filterPlaceholder="Filter name"
            showFilterMenu={false}
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
            filter
            filterElement={typeFilterTemplate}
            showFilterMenu={false}
          />
          <Column
            field="grade"
            header="Rating"
            body={(row: Row) => <Rating value={row.grade} cancel={false} readOnly />}
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
            body={(row: Row) =>
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
          <h1 className="m-0">My playlists</h1>
          <div className="flex items-center gap-2">
            <div className="text-gray-500">{totalElements} total</div>
            <Button
              icon={`pi pi-filter${showPlaylistFilters ? "-slash" : ""}`}
              outlined
              onClick={() => setShowPlaylistFilters((prev) => !prev)}
              tooltip={showPlaylistFilters ? "Hide filters" : "Show filters"}
              tooltipOptions={{ position: "left" }}
            />
          </div>
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
          emptyMessage="You currently have no playlists."
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
