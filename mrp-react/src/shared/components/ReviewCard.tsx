import { useState } from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { Image } from "primereact/image";
import { ReviewResponse } from "@shared/utils";
import { useGetImage } from "../hooks/useGetImage";
import ReviewDialog from "../../features/review/ReviewDialog.tsx";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ReviewCardProps {
  review: ReviewResponse;
  refetch: () => Promise<void>;
}

export const ReviewCard = ({ review, refetch }: ReviewCardProps) => {
  const [visible, setVisible] = useState(false);

  const title =
    review.type === "SONG"
      ? (review.songName ?? "Song")
      : (review.albumName ?? "Album");

  const { loading, exists, image } = useGetImage(
    review.image
      ? review.image.startsWith("/api")
        ? review.image
        : `${VITE_BACKEND_URL}${review.image}`
      : undefined,
  );

  const header = (
    <div className="w-full h-[180px] bg-[#f5f5f5] overflow-hidden">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
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
    <div className="flex justify-between items-center mt-4">
      <span className="text-sm text-[#6b6b6b]">
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
        <h3 className="m-0 mb-2 text-xl font-bold truncate">{title}</h3>
        <div className="flex flex-wrap justify-between mb-2">
          <Rating value={review.grade} readOnly cancel={false} stars={5} />
          <Tag
            value={review.type === "SONG" ? "Song" : "Album"}
            severity={review.type === "SONG" ? "success" : "info"}
            style={{ fontWeight: 600, padding: "0.25rem 0.75rem" }}
          />
        </div>
        <p className="text-sm leading-relaxed">{review.description}</p>
      </Card>

      {visible && (
        <ReviewDialog
          visible={visible}
          onHide={() => setVisible(false)}
          reviewId={review.id}
          reviewType={review.type}
          refetch={refetch}
        />
      )}
    </>
  );
};
