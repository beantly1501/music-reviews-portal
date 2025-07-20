import { ReviewCard } from "@shared/components";
import { ReviewCardType } from "@shared/utils";
import { useGetNewestReviews } from "./hooks/useGetNewestReviews.ts";

export default function SongsPage() {
  const reviews = useGetNewestReviews();

  return (
    <div className="flex flex-wrap gap-4 justify-content-center">
      {reviews?.map((review: ReviewCardType) => <ReviewCard review={review} />)}
    </div>
  );
}
