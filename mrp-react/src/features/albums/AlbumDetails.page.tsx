import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "primereact/card";
import { Image } from "primereact/image";
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
import { useGetAlbum } from "../../shared/hooks/useGetAlbum.ts";
import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { useGetAlbumReviews } from "../../shared/hooks/useGetAlbumReviews.ts";
import {
  ArtistType,
  GenreType,
  ReviewResponse,
  SongType,
  UserRoleEnum,
} from "@shared/utils";
import { Chip } from "primereact/chip";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { toast } from "../../shared/components/ToastContext.tsx";
import CreateAlbumDialog from "./CreateAlbumDialog.tsx";
import { deleteAlbum } from "./utils/helpers.tsx";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AlbumDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const albumId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const {
    album,
    loading: loadingAlbum,
    error: albumError,
    refetch: albumRefetch,
  } = useGetAlbum(albumId);
  const {
    loading: loadingCover,
    exists: coverExists,
    image: coverSrc,
    imageAsJsFile,
    refetch: refetchImage,
  } = useGetImage(
    albumId ? `${VITE_BACKEND_URL}/images/album/${albumId}` : undefined,
  );
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
  } = useGetAlbumReviews(albumId);
  const { user } = useCurrentUser();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();

  const [editAlbumDialogVisible, setEditAlbumDialogVisible] =
    useState<boolean>(false);

  const [deleting, setDeleting] = useState<boolean>(false);

  const openDialog = (row: ReviewResponse) => {
    setSelectedReviewId(row.id);
    setDialogVisible(true);
  };
  const closeDialog = () => setDialogVisible(false);

  const handlePage = (e: DataTablePageEvent) => {
    onPage({ first: e.first, rows: e.rows, page: e.page });
  };

  const handleSort = (e: DataTableStateEvent) => {
    const normalized: 1 | -1 | undefined =
      e.sortOrder === 1 ? 1 : e.sortOrder === -1 ? -1 : undefined;

    onSort({
      sortField: e.sortField ?? undefined,
      sortOrder: normalized,
    });
  };

  const handleDelete = () => {
    confirmDialog({
      header: "Confirm Delete",
      message: "Delete this album permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          setDeleting(true);
          await deleteAlbum(album?.id ?? -1).then(() => navigate("/albums"));
          toast.success("Album deleted.");
        } catch {
          toast.error("Failed to delete album.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (!albumId) {
    return <Message severity="error" text="Invalid album id." />;
  }

  if (loadingAlbum) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading album…</div>
      </div>
    );
  }

  if (albumError || !album) {
    return <Message severity="error" text={albumError ?? "Album not found."} />;
  }

  const canModify = !!user && user?.role === UserRoleEnum.ADMIN;

  const handleRefetch = () => {
    albumRefetch?.();
    refetchImage?.();
  };

  return (
    <div className="p-3">
      <div className="flex justify-between mb-3">
        <div>
          <Button
            label="Home"
            icon="pi pi-home"
            onClick={() => navigate("/")}
            severity="secondary"
            outlined
          />
        </div>
        <div className="flex justify-end gap-3">
          {canModify && (
            <div className="flex gap-3">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => setEditAlbumDialogVisible(true)}
                severity="info"
                outlined
              />
              <Button
                label="Delete"
                icon={deleting ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                onClick={handleDelete}
                severity="danger"
                outlined
              />
            </div>
          )}
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            onClick={() => navigate(-1)}
            severity="secondary"
            outlined
          />
        </div>
      </div>

      <Card className="shadow-md" style={{ overflow: "hidden", borderRadius: 12 }}>
        <div className="flex gap-4 flex-col md:flex-row">
          <div style={{ width: 300, maxWidth: "100%" }}>
            <Image
              src={
                !loadingCover && coverExists
                  ? (coverSrc ?? undefined)
                  : undefined
              }
              alt={album.name}
              imageClassName="w-full"
              imageStyle={{ height: 280, objectFit: "cover" }}
            />
          </div>

          <div className="flex flex-col gap-3 w-fit">
            <div className="text-2xl font-semibold mb-2">{album.name}</div>

            {Array.isArray(album.artists) && album.artists.length > 0 && (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <i className="pi pi-user text-gray-500" />
                {album.artists.map((a: ArtistType, i) => (
                  <span key={a.id} className="flex items-center gap-2">
                    <span
                      className="cursor-pointer text-[0.95rem] hover:underline"
                      onClick={() => navigate(`/artist/${a.id}`)}
                    >
                      {a.name}
                    </span>
                    {i < album.artists!.length - 1 && <span className="text-gray-400">·</span>}
                  </span>
                ))}
              </div>
            )}

            {album.year ? (
              <div className="text-gray-500 mb-2">Released {album.year}</div>
            ) : null}

            {Array.isArray(album.genres) && album.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {album.genres.map((g: GenreType) => (
                  <Chip key={g.id ?? g.name} label={g.name} className="text-[0.85rem]" />
                ))}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {album.link && (
                <Button
                  label="Open Album Link"
                  icon="pi pi-external-link"
                  onClick={() => window.open(album.link, "_blank")}
                />
              )}
            </div>
          </div>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="m-0">Songs</h2>
        </div>

        <DataTable
          value={album.songs ?? []}
          rowHover
          stripedRows
          removableSort
          paginator
          rows={10}
          emptyMessage="No songs on this album."
          onRowClick={(row) => navigate(`/song/${row.data.id}`)}
        >
          <Column field="name" header="Title" sortable />

          <Column
            field="year"
            header="Year"
            body={(row: SongType) => row.year ?? "-"}
            sortable
          />
        </DataTable>
      </Card>

      <Divider />

      <Card>
        <div className="flex items-center justify-between mb-2">
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
          emptyMessage="No reviews for this album yet."
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
            body={() => <Tag value="Album" severity="info" />}
          />
        </DataTable>
      </Card>

      {dialogVisible && selectedReviewId !== undefined && (
        <ReviewDialog
          key={selectedReviewId}
          visible={dialogVisible}
          onHide={closeDialog}
          reviewId={selectedReviewId}
          reviewType="ALBUM"
          refetch={refresh}
        />
      )}

      {editAlbumDialogVisible && (
        <CreateAlbumDialog
          visible={editAlbumDialogVisible}
          setVisible={setEditAlbumDialogVisible}
          onCreated={handleRefetch}
          existingAlbumData={{
            albumId: albumId,
            formData: {
              name: album.name,
              year: album.year,
              cover: coverExists ? imageAsJsFile! : undefined,
              link: album.link,
              songIds: album.songs?.map((s) => s.id) ?? [],
              artistIds: album.artists?.map((ar) => ar.id) ?? [],
            },
          }}
        />
      )}

      <ConfirmDialog />
    </div>
  );
}
