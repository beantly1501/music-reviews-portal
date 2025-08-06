import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { ReviewResponse } from "@shared/utils";

interface ReviewCardProps {
  review: ReviewResponse;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  // Determine display title
  const title = review.type === "SONG" ? review.songName : review.albumName;

  // Footer: reviewer tag and creation date
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
    <Card
      title={title}
      footer={footer}
      style={{
        width: "300px",
        borderRadius: "0.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        margin: "1rem",
      }}
    >
      <div className="flex flex-wrap justify-content-between">
        <Rating
          value={review.grade}
          readOnly
          cancel={false}
          stars={5}
          style={{ marginBottom: "0.5rem" }}
        />
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
  );
};
