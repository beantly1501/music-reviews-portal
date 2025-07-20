import { ReviewCard } from "@shared/components";
import { ReviewCardType } from "@shared/utils";
import { CAT_IMAGE } from "@shared/utils";
import { SongOrAlbumEnum } from "@shared/utils";

export default function AlbumsPage() {
  const review: ReviewCardType = {
    id: 5,
    name: "The doors",
    date: "15-01-2025",
    description: "test",
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
