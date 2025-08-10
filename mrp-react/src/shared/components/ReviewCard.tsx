import { useState } from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { Image } from "primereact/image";
import { ReviewResponse } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";

interface ReviewCardProps {
  review: ReviewResponse;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const [visible, setVisible] = useState(false);

  const title =
    review.type === "SONG"
      ? (review.songName ?? "Song")
      : (review.albumName ?? "Album");

  const { loading, exists, image } = useGetImage(
    review.image
      ? review.image.startsWith("/api")
        ? review.image
        : `/api${review.image}`
      : undefined,
  );

  const header = (
    <div className="song-card__img-wrap">
      {loading ? (
        <div className="song-card__img placeholder flex align-items-center justify-content-center">
          <i className="pi pi-spin pi-spinner" />
        </div>
      ) : (
        <Image
          src={exists && image ? image : undefined}
          imageStyle={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      )}
    </div>
  );

  const footer = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1rem",
      }}
    >
      <span style={{ fontSize: "0.875rem", color: "#6b6b6b" }}>
        {new Date(review.creationDate).toLocaleDateString("hr-HR")}
      </span>
      <Tag
        value={review.username}
        severity="warning"
        style={{ fontWeight: 600, padding: "0.25rem 0.75rem" }}
      />
    </div>
  );

  return (
    <>
      <Card
        title={title}
        header={header}
        footer={footer}
        style={{
          width: 300,
          borderRadius: "0.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          margin: "1rem",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => setVisible(true)}
      >
        <div
          className="flex flex-wrap justify-content-between"
          style={{ marginBottom: "0.5rem" }}
        >
          <Rating value={review.grade} readOnly cancel={false} stars={5} />
          <Tag
            value={review.type === "SONG" ? "Song" : "Album"}
            severity={review.type === "SONG" ? "success" : "info"}
            style={{ fontWeight: 600, padding: "0.25rem 0.75rem" }}
          />
        </div>
        <p style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
          {review.description}
        </p>
      </Card>

      {visible && (
        <ReviewDialog
          visible={visible}
          onHide={() => setVisible(false)}
          reviewId={review.id}
          reviewType={review.type}
        />
      )}
    </>
  );
};
