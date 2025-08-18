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
import {
  GenreType,
  ReviewResponse,
  toCommaSeparated,
  UserRoleEnum,
} from "@shared/utils";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { deleteSong } from "./utils/helpers.tsx";
import CreateSongDialog from "./CreateSongDialog.tsx";
import { useSongAudio } from "../../shared/hooks/useSongAudio.ts";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { toast } from "../../shared/components/ToastContext.tsx";

export default function SongDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const songId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const {
    song,
    loading: loadingSong,
    error: songError,
    refetch: songRefetch,
  } = useGetSong(songId);
  const {
    exists: audioExists,
    loading: loadingAudio,
    url: audioUrl,
    audioAsJsFile,
  } = useSongAudio(song?.id ?? -1, song?.fileUrl);
  const {
    loading: loadingImage,
    exists: imageExists,
    image: imageSrc,
    imageAsJsFile,
    refetch: refetchImage,
  } = useGetImage(songId ? `/api/images/song/${songId}` : undefined);
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
  const { user } = useCurrentUser();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedReviewId, setSelectedReviewId] = useState<
    number | undefined
  >();
  const [editSongDialogVisible, setEditSongDialogVisible] =
    useState<boolean>(false);

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
      message: "Delete this song permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          setDeleting(true);
          await deleteSong(song?.id ?? -1).then(() => navigate("/songs"));
          toast.success("Song deleted.");
        } catch {
          toast.error("Failed to delete song.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

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

  const canModify = !!user && user?.role === UserRoleEnum.ADMIN;

  const handleRefetch = () => {
    refetchImage?.();
    songRefetch?.();
  };

  return (
    <div className="song-details-page p-3">
      <div className="flex justify-content-between">
        <div>
          <Button
            label="Home"
            icon="pi pi-home"
            onClick={() => navigate("/")}
            severity="secondary"
            outlined
          />
        </div>
        <div className="flex justify-content-end mb-3 gap-3">
          {canModify && (
            <div className="flex gap-3">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => setEditSongDialogVisible(true)}
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

      {/* Song Card */}
      <Card
        className="p-shadow-2"
        style={{ overflow: "hidden", borderRadius: 12 }}
      >
        <div className="flex gap-4 flex-column md:flex-row">
          <div style={{ width: 300, maxWidth: "100%" }}>
            {loadingImage ? (
              <div className="song-card__img placeholder flex align-items-center justify-content-center">
                <i className="pi pi-spin pi-spinner" />
              </div>
            ) : (
              <Image
                src={imageExists && imageSrc ? imageSrc : undefined}
                imageStyle={{ width: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          <div className="flex-1">
            <div className="text-2xl font-semibold mb-2">{song.name}</div>
            <div className="text-lg font-semibold mb-2">
              {toCommaSeparated(song.artists?.map((a) => a.name) ?? [])}
            </div>

            {song.year ? (
              <div className="text-color-secondary mb-2">
                Released {song.year}
              </div>
            ) : null}

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
            <div className="flex gap-5 flex-wrap">
              {song.link && (
                <Button
                  label="Open Song Link"
                  icon="pi pi-external-link"
                  onClick={() => window.open(song.link, "_blank")}
                />
              )}
              <div className="flex">
                {loadingAudio ? (
                  <i className="pi pi-spin pi-spinner" />
                ) : audioExists && audioUrl ? (
                  <audio controls src={audioUrl} className="my-auto" />
                ) : (
                  <div className="song-card__placeholder my-auto">
                    <p>No audio file available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex align-items-center justify-content-between mb-2">
          <h2 className="m-0">Albums</h2>
        </div>

        <DataTable
          value={song.albums ?? []}
          rowHover
          stripedRows
          removableSort
          paginator
          rows={10}
          emptyMessage="No albums for this song."
        >
          <Column field="name" header="Name" sortable />
          <Column field="year" header="Year" sortable />
        </DataTable>
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
          key={selectedReviewId}
          visible={dialogVisible}
          onHide={closeDialog}
          reviewId={selectedReviewId}
          reviewType="SONG"
          refetch={refresh}
        />
      )}

      {editSongDialogVisible && (
        <CreateSongDialog
          visible={editSongDialogVisible}
          setVisible={setEditSongDialogVisible}
          onCreated={handleRefetch}
          existingSongData={{
            songId,
            formData: {
              name: song.name,
              cover: imageExists && imageAsJsFile ? imageAsJsFile : undefined,
              file: audioExists && audioAsJsFile ? audioAsJsFile : undefined,
              year: song.year ?? undefined,
              link: song.link ?? undefined,
              albumIds: song.albums?.map((a) => a.id) ?? [],
              artistIds: song.artists?.map((a) => a.id) ?? [],
              genreIds: song.genres?.map((g) => g.id) ?? [],
            },
          }}
        />
      )}
      <ConfirmDialog />
    </div>
  );
}
