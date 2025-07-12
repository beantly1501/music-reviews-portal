import ReviewCard from "../../shared/components/ReviewCard.tsx";
import { ReviewType } from "../../shared/utils/types.tsx";
import { CAT_IMAGE } from "../../shared/utils/constants.tsx";
import { SongOrAlbumEnum } from "../../shared/utils/enums.tsx";
import { useGetNewestReviews } from "./hooks/useGetNewestReviews.ts";
import { useEffect } from "react";

export default function SongsPage() {
  const reviews = useGetNewestReviews();

  return (
    <div className="flex flex-wrap gap-4 justify-content-center">
      {reviews?.map((review: ReviewType) => (
        <ReviewCard review={review}>
      ))}
    </div>
  );
}
