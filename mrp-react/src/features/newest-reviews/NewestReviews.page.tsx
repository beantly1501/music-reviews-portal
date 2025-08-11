import { useGetNewestRatings } from "./hooks/useGetNewestReviews.ts";
import { ReviewCard } from "@shared/components";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Button } from "primereact/button";

export default function SongsPage() {
  const { reviews, loading, error, refetch } = useGetNewestRatings(20);

  if (loading) {
    return (
      <div className="page-status">
        <ProgressSpinner />
        <div className="page-status__text">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-status">
        <Message severity="error" text={`Error: ${error}`} />
        <Button
          label="Retry"
          icon="pi pi-refresh"
          onClick={refetch}
          className="page-status__action"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-content-center">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewCard review={review} refetch={refetch} />
        ))
      ) : (
        <div className="text-empty">No reviews found.</div>
      )}
    </div>
  );
}
