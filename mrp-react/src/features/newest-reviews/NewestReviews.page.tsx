import { useGetNewestRatings } from "./hooks/useGetNewestReviews.ts";
import { ReviewCard } from "@shared/components";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Button } from "primereact/button";

export default function SongsPage() {
  const { reviews, loading, error, refetch } = useGetNewestRatings(20);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <Message severity="error" text={`Error: ${error}`} />
        <Button label="Retry" icon="pi pi-refresh" onClick={refetch} className="mt-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewCard review={review} refetch={refetch} />
        ))
      ) : (
        <div className="text-[#6b7280] text-[0.95rem]">No reviews found.</div>
      )}
    </div>
  );
}
