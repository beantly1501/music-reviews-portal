import ReviewCard from "../../shared/components/ReviewCard.tsx";
import { ReviewType } from "../../shared/utils/types.tsx";
import { CAT_IMAGE } from "../../shared/utils/constants.tsx";
import { SongOrAlbumEnum } from "../../shared/utils/enums.tsx";

export default function AlbumsPage() {
  const review: ReviewType = {
    id: 5,
    name: "The doors",
    date: '15-01-2025',
    image: CAT_IMAGE,
    rating: 5,
    songOrAlbum: SongOrAlbumEnum.ALBUM,
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
    </div>
  );
}
