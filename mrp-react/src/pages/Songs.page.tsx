import ReviewCard from "../components/ReviewCard.tsx";
import { ReviewType } from "../utils/types.tsx";
import { CAT_IMAGE } from "../utils/constants.tsx";
import { SongOrAlbumEnum } from "../utils/enums.tsx";

export default function SongsPage() {
  const review: ReviewType = {
    id: 5,
    name: "Wish you were here",
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
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
      <ReviewCard review={review} />
    </div>
  );
}
