import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { getToken, ReviewResponse } from "@shared/utils";

interface ReviewCardProps {
  review: ReviewResponse;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const title =
    review.type === "SONG"
      ? (review.songName ?? "Song")
      : (review.albumName ?? "Album");

  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const token = getToken();

  useEffect(() => {
    let revoke: string | undefined;
    const controller = new AbortController();

    const imageUrl = `${BACKEND_URL}${review.image}`;

    async function load() {
      try {
        const res = await fetch(imageUrl, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          setImgUrl(undefined);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revoke = url;
        setImgUrl(url);
      } catch {
        setImgUrl(undefined);
      }
    }

    load();

    return () => {
      controller.abort();
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [review.image, token]);

  const header = (
    <img
      src={imgUrl}
      alt={title}
      style={{
        width: "100%",
        height: 180,
        objectFit: "cover",
        borderTopLeftRadius: "0.5rem",
        borderTopRightRadius: "0.5rem",
        display: "block",
      }}
      loading="lazy"
    />
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
      }}
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
  );
};
