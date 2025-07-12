import { ReviewCard } from "@shared/components";
import { ReviewType } from "@shared/utils";
import { CAT_IMAGE } from "@shared/utils";
import { SongOrAlbumEnum } from "@shared/utils";

export default function SongsPage() {
  const review: ReviewType = {
    id: 5,
    name: "Wish you were here",
    date: "9-8-2025",
    description: "test2",
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
