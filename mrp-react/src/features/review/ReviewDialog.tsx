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
import { deleteAlbumReview, deleteSongReview } from "./utils/helpers.tsx";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const navigate = useNavigate();

  const { review, loading, error } = useGetReview(reviewId, reviewType);
  const {
    loading: loadingReviewImg,
    exists: reviewImgExists,
    image: reviewImg,
  } = useGetImage(
    review?.image ? `${VITE_BACKEND_URL}${review?.image}` : undefined,
  );

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
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="ml-[5px]">
        <span className="text-[1.2rem] font-bold">
          {review?.type === "SONG"
            ? (review?.songName ?? "Song")
            : (review?.albumName ?? "Album")}
        </span>
      </div>
      <div className="flex items-center gap-5 mr-5">
        {canEdit && (
          <Button
            label="Edit"
            icon="pi pi-pencil"
            onClick={() => setVisibleUpdateReview(true)}
            severity="info"
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
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-[10px]">
          <Message severity="error" text="Invalid review id." />
        </div>
      )}

      {reviewId && loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-[10px]">
          <ProgressSpinner />
          <div className="text-[#6b7280]">Loading…</div>
        </div>
      )}

      {reviewId && !loading && (error || !review) && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-[10px]">
          <Message severity="error" text={error ?? "Review not found."} />
        </div>
      )}

      {reviewId && !loading && review && (
        <Card className="rdialog__card shadow-md">
          <div className="rdialog__hero" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, padding: "16px 16px 0 16px" }}>
            <div className="w-full h-[220px] bg-[#f5f5f5] overflow-hidden rounded-[10px]">
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
                imageClassName="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-[10px]">
              <div className="flex items-center gap-2 text-[#6b7280] text-[0.95rem]">
                <span
                  className="inline-flex items-center gap-[6px] cursor-pointer select-none"
                  onClick={() => {
                    if (user?.id === review?.userId) {
                      navigate(`/profile`);
                    } else {
                      navigate(`/user/${review?.userId}`);
                    }
                  }}
                >
                  <i className="pi pi-user" /> {review.username}
                </span>
                <span className="opacity-70">•</span>
                <span className="inline-flex items-center gap-[6px]">
                  <i className="pi pi-calendar" /> {createdAt}
                </span>
              </div>

              <div className="mt-1">
                <Rating value={review.grade} cancel={false} readOnly />
              </div>

              <p className="m-0 text-[#374151] leading-[1.65] text-[0.98rem]">{review.description}</p>
            </div>
          </div>

          <Divider />

          <div className="px-4 pb-4">
            <div className="rdialog__entity" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
              <div className="flex flex-col gap-[10px]">
                {review.type === "SONG" && entity && (
                  <>
                    <div className="font-bold text-[1.1rem]">
                      {(entity as SongType).name}
                    </div>
                    {(entity as SongType).year ? (
                      <div className="text-[#6b7280] text-[0.95rem]">
                        Released {(entity as SongType).year}
                      </div>
                    ) : null}

                    <div className="flex gap-2 flex-wrap my-[6px]">
                      {(entity as SongType).genres?.map((g) => (
                        <Chip
                          key={g.id}
                          label={g.name}
                          className="text-[0.85rem]"
                        />
                      ))}
                    </div>

                    <div className="mt-1">
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
                    <div className="font-bold text-[1.1rem]">
                      {(entity as AlbumType).name}
                    </div>
                    {(entity as AlbumType).year ? (
                      <div className="text-[#6b7280] text-[0.95rem]">
                        Released {(entity as AlbumType).year}
                      </div>
                    ) : null}

                    <div className="mt-1">
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
                  <div className="text-[#6b7280] text-[0.95rem]">
                    <i className="pi pi-spin pi-spinner" /> Loading details…
                  </div>
                )}
                {(songError || albumError) && (
                  <div className="text-[#6b7280] text-[0.95rem]">
                    <i className="pi pi-exclamation-triangle" /> Couldn't load
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
                    <div className="w-full h-full">
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
