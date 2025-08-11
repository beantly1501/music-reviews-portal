import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  AlbumReviewFormData,
  AlbumType,
  deleteAlbumReview,
  deleteSongReview,
  SongReviewFormData,
  SongType,
  UserRoleEnum,
} from "@shared/utils";
import { useGetReview } from "../../shared/hooks/useGetReview.ts";
import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { useGetAlbum } from "../../shared/hooks/useGetAlbum.ts";
import { Chip } from "primereact/chip";
import { useGetSongFull } from "../../shared/hooks/useGetSongFull.ts";
import { CreateSongReview } from "../songs/CreateSongReview.tsx";
import { toast } from "../../shared/components/ToastContext.tsx";
import { CreateAlbumReview } from "../albums/CreateAlbumReview.tsx";
import { updateSongReview } from "../songs/hooks/updateAlbumReview.ts";
import { updateAlbumReview } from "../albums/hooks/updateAlbumReview.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

type Props = {
  visible: boolean;
  onHide: () => void;
  reviewId: number | undefined;
  reviewType?: "SONG" | "ALBUM";
  refetch: () => Promise<void>;
};

export default function ReviewDialog({
  visible,
  onHide,
  reviewId,
  reviewType,
  refetch,
}: Props) {
  const [visibleUpdateReview, setVisibleUpdateReview] =
    useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const { user } = useCurrentUser();

  const { review, loading, error } = useGetReview(reviewId, reviewType);
  const {
    loading: loadingReviewImg,
    exists: reviewImgExists,
    image: reviewImg,
  } = useGetImage(review?.image ? `/api${review?.image}` : undefined);

  const songId = review?.type === "SONG" ? review.songId : undefined;
  const albumId = review?.type === "ALBUM" ? review.albumId : undefined;

  const {
    song,
    songAudio,
    songAudioExists,
    loading: loadingSong,
    loadingSongAudio,
    error: songError,
  } = useGetSongFull(songId ?? undefined);

  const {
    album,
    loading: loadingAlbum,
    error: albumError,
  } = useGetAlbum(albumId ?? undefined);

  const entity = (review?.type === "SONG" ? song : album) as
    | SongType
    | AlbumType
    | undefined;

  const createdAt = review
    ? new Date(review.creationDate).toLocaleDateString("hr-HR", {
        timeZone: "UTC",
      })
    : "";

  const canEdit = !!user && !!review && user.username === review.username;

  const canDelete =
    !!user &&
    !!review &&
    (user.username === review.username || user?.role === UserRoleEnum.ADMIN);

  const handleSubmit = async (
    formData: SongReviewFormData | AlbumReviewFormData,
  ) => {
    try {
      if (review?.type === "SONG") {
        await updateSongReview(reviewId!, formData as SongReviewFormData);
      } else if (review?.type === "ALBUM") {
        await updateAlbumReview(reviewId!, formData as AlbumReviewFormData);
      }
      onHide();
      toast.success(`Successfully updated review!`);
      refetch?.();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = () => {
    if (!review || !reviewId) return;

    confirmDialog({
      header: "Confirm Delete",
      message: "Delete this review permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          setDeleting(true);
          if (review.type === "SONG") {
            await deleteSongReview(reviewId);
          } else {
            await deleteAlbumReview(reviewId);
          }
          toast.success("Review deleted.");
          onHide();
          await refetch?.();
        } catch {
          toast.error("Failed to delete review.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const header = review && !loading && (
    <div className="rdialog__header">
      <div className="rdialog__header-left">
        <span className="rdialog__title">
          {review?.type === "SONG"
            ? (review?.songName ?? "Song")
            : (review?.albumName ?? "Album")}
        </span>
      </div>
      <div className="rdialog__header-right flex gap-2">
        {canEdit && (
          <Button
            label="Edit review"
            icon="pi pi-pencil"
            onClick={() => setVisibleUpdateReview(true)}
            severity="secondary"
            outlined
            size="small"
          />
        )}
        {canDelete && (
          <Button
            label="Delete"
            icon={deleting ? "pi pi-spin pi-spinner" : "pi pi-trash"}
            severity="danger"
            outlined
            size="small"
            onClick={handleDelete}
            disabled={deleting}
          />
        )}
        <Tag
          value={review?.type === "SONG" ? "Song Review" : "Album Review"}
          severity={review?.type === "SONG" ? "success" : "info"}
          rounded
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      className="rdialog"
      modal
      draggable={false}
      resizable={false}
      breakpoints={{ "1400px": "70vw", "960px": "85vw", "640px": "95vw" }}
      style={{ width: "60vw", maxWidth: 980 }}
    >
      {!reviewId && (
        <div className="rdialog__center">
          <Message severity="error" text="Invalid review id." />
        </div>
      )}

      {reviewId && loading && (
        <div className="rdialog__center">
          <ProgressSpinner />
          <div className="rdialog__loading-text">Loading…</div>
        </div>
      )}

      {reviewId && !loading && (error || !review) && (
        <div className="rdialog__center">
          <Message severity="error" text={error ?? "Review not found."} />
        </div>
      )}

      {reviewId && !loading && review && (
        <Card className="rdialog__card p-shadow-2">
          {/* Hero */}
          <div className="rdialog__hero">
            <div className="rdialog__hero-media">
              <Image
                src={
                  !loadingReviewImg && reviewImgExists
                    ? (reviewImg ?? undefined)
                    : undefined
                }
                alt={
                  review.type === "SONG"
                    ? (review.songName ?? "Song")
                    : (review.albumName ?? "Album")
                }
                imageClassName="rdialog__hero-img"
              />
            </div>

            <div className="rdialog__hero-info">
              <div className="rdialog__meta">
                <span className="rdialog__meta-item">
                  <i className="pi pi-user" /> {review.username}
                </span>
                <span className="rdialog__meta-sep">•</span>
                <span className="rdialog__meta-item">
                  <i className="pi pi-calendar" /> {createdAt}
                </span>
              </div>

              <div className="rdialog__rating">
                <Rating value={review.grade} cancel={false} readOnly />
              </div>

              <p className="rdialog__text">{review.description}</p>
            </div>
          </div>

          <Divider />

          {/* Entity details */}
          <div className="rdialog__section">
            <div className="rdialog__entity">
              <div className="rdialog__entity-body">
                {review.type === "SONG" && entity && (
                  <>
                    <div className="rdialog__entity-title">
                      {(entity as SongType).name}
                    </div>
                    {(entity as SongType).year ? (
                      <div className="rdialog__entity-sub">
                        Released {(entity as SongType).year}
                      </div>
                    ) : null}

                    <div className="rdialog__entity-tags">
                      {(entity as SongType).genres?.map((g) => (
                        <Chip
                          key={g.id}
                          label={g.name}
                          className="rdialog__tag"
                        />
                      ))}
                    </div>

                    <div className="rdialog__entity-actions">
                      {(entity as SongType).link && (
                        <Button
                          label="Open Song Link"
                          icon="pi pi-external-link"
                          onClick={() =>
                            window.open((entity as SongType).link!, "_blank")
                          }
                        />
                      )}
                    </div>
                  </>
                )}

                {review.type === "ALBUM" && entity && (
                  <>
                    <div className="rdialog__entity-title">
                      {(entity as AlbumType).name}
                    </div>
                    {(entity as AlbumType).year ? (
                      <div className="rdialog__entity-sub">
                        Released {(entity as AlbumType).year}
                      </div>
                    ) : null}

                    <div className="rdialog__entity-actions">
                      {(entity as AlbumType).link && (
                        <Button
                          label="Open Album Link"
                          icon="pi pi-external-link"
                          onClick={() =>
                            window.open((entity as AlbumType).link!, "_blank")
                          }
                        />
                      )}
                    </div>
                  </>
                )}

                {(loadingSong || loadingAlbum) && (
                  <div className="rdialog__entity-loading">
                    <i className="pi pi-spin pi-spinner" /> Loading details…
                  </div>
                )}
                {(songError || albumError) && (
                  <div className="rdialog__entity-error">
                    <i className="pi pi-exclamation-triangle" /> Couldn’t load
                    details.
                  </div>
                )}
              </div>
              {review.type === "SONG" && (
                <div className="my-auto">
                  {loadingSongAudio ? (
                    <i className="pi pi-spin pi-spinner" />
                  ) : songAudioExists && songAudio ? (
                    <audio controls src={songAudio} className="w-full" />
                  ) : (
                    <div className="song-card__placeholder">
                      No audio file available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {visibleUpdateReview && review && review.songId && !loading && (
        <CreateSongReview
          visible={visibleUpdateReview}
          name={review?.songName ?? ""}
          songId={review.songId}
          onHide={() => setVisibleUpdateReview(false)}
          onSubmit={handleSubmit}
          existingFormData={{
            songId: review.songId,
            grade: review?.grade,
            description: review?.description,
          }}
        />
      )}
      {visibleUpdateReview && review && review.albumId && !loading && (
        <CreateAlbumReview
          visible={visibleUpdateReview}
          name={review?.albumName ?? ""}
          albumId={review.albumId}
          onHide={() => setVisibleUpdateReview(false)}
          onSubmit={handleSubmit}
          existingFormData={{
            albumId: review.albumId,
            grade: review?.grade,
            description: review?.description,
          }}
        />
      )}
      <ConfirmDialog />
    </Dialog>
  );
}
