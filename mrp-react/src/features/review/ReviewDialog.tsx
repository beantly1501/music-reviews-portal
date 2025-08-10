import { useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";

import { AlbumType, SongType } from "@shared/utils";
import { useGetReview } from "../../shared/hooks/useGetReview.ts";
import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { useGetSong } from "../../shared/hooks/useGetSong.ts";
import { useGetAlbum } from "../../shared/hooks/useGetAlbum.ts";

type Props = {
  visible: boolean;
  onHide: () => void;
  reviewId: number | undefined;
  reviewType?: "SONG" | "ALBUM"; // optional hint
};

export default function ReviewDialog({
  visible,
  onHide,
  reviewId,
  reviewType,
}: Props) {
  // fetch the review (always call the hook)
  const { review, loading, error } = useGetReview(reviewId, reviewType);

  // review image path
  const reviewImgPath = useMemo(() => {
    const path = review?.image;
    if (!path) return undefined;
    return path.startsWith("/api") ? path : `/api${path}`;
  }, [review?.image]);

  const {
    loading: loadingReviewImg,
    exists: reviewImgExists,
    image: reviewImg,
  } = useGetImage(reviewImgPath);

  const songId = review?.type === "SONG" ? review.songId : undefined;
  const albumId = review?.type === "ALBUM" ? review.albumId : undefined;

  const { song, loading: loadingSong, error: songError } = useGetSong(songId);
  const {
    album,
    loading: loadingAlbum,
    error: albumError,
  } = useGetAlbum(albumId);

  const entity = (review?.type === "SONG" ? song : album) as
    | SongType
    | AlbumType
    | undefined;

  const entityImgPath = useMemo(() => {
    const path = (
      review?.type === "SONG" ? song?.imageUrl : album?.imageUrl
    ) as string | undefined;
    if (!path) return undefined;
    return path.startsWith("/api") ? path : `/api${path}`;
  }, [review?.type, song, album]);

  const {
    loading: loadingEntityImg,
    exists: entityImgExists,
    image: entityImg,
  } = useGetImage(entityImgPath);

  const createdAt = review
    ? new Date(review.creationDate).toLocaleDateString("hr-HR", {
        timeZone: "UTC",
      })
    : "";

  const header = (
    <div className="rdialog__header">
      <div className="rdialog__header-left">
        <span className="rdialog__title">
          {review?.type === "SONG"
            ? (review?.songName ?? "Song")
            : (review?.albumName ?? "Album")}
        </span>
      </div>
      <div className="rdialog__header-right">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => {}}
          severity="secondary"
          outlined
          size="small"
        />
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
            <h3 className="rdialog__section-title">
              {review.type === "SONG" ? "Song" : "Album"} details
            </h3>

            <div className="rdialog__entity">
              <div className="rdialog__entity-media">
                <Image
                  src={
                    !loadingEntityImg && entityImgExists
                      ? (entityImg ?? undefined)
                      : undefined
                  }
                  alt={
                    review.type === "SONG"
                      ? (review.songName ?? "Song")
                      : (review.albumName ?? "Album")
                  }
                  imageClassName="rdialog__entity-img"
                />
              </div>

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
                        <Tag
                          key={g.id}
                          value={g.name}
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
            </div>
          </div>
        </Card>
      )}
    </Dialog>
  );
}
