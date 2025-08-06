import { useGetNewestRatings } from "./hooks/useGetNewestReviews.ts";
import { ReviewCard } from "@shared/components";

export default function SongsPage() {
  const { reviews, loading, error } = useGetNewestRatings(20);

  if (loading) return <div>Loading newest reviews...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-wrap justify-content-center">
      {reviews.map((review) => (
        <ReviewCard review={review} />
      ))}
    </div>
  );
}
