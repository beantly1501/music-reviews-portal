import ReviewCard from "../../shared/components/ReviewCard.tsx";
import { ReviewType } from "../../shared/utils/types.tsx";
import { CAT_IMAGE } from "../../shared/utils/constants.tsx";
import { SongOrAlbumEnum } from "../../shared/utils/enums.tsx";

export default function SongsPage() {
  const review: ReviewType = {
    id: 5,
    name: "Wish you were here",
    date: "9-8-2025",
    image: CAT_IMAGE,
    rating: 5,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "jbockal",
  };

  return (
    <div className="flex flex-wrap gap-4 justify-content-center">
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
    </div>
  );
}
