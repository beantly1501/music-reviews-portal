import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

import { formatDate, ReviewType, SongOrAlbumEnum } from "@shared/utils";
import { Rating } from "primereact/rating";

interface Props {
  review: ReviewType;
}

export function ReviewCard({ review }: Props) {
  const header = (
    <img
      className="overflow-y-hidden"
      style={{ maxHeight: "250px", objectFit: "cover" }}
      alt="cat"
      src={review.image}
    />
  );

  return (
    <div className="card flex justify-content-center full-size-body">
      <Card
        title={review.name}
        subTitle={
          <div className="flex flex-1 gap-3">
            <Tag value={formatDate(review.date)} severity="info" />
            <Tag
              value={
                review.songOrAlbum === SongOrAlbumEnum.SONG ? "Song" : "Album"
              }
              severity={
                review.songOrAlbum === SongOrAlbumEnum.SONG ? "success" : "info"
              }
            />
            <Rating value={review.rating} cancel={false} readOnly />
          </div>
        }
        header={header}
        footer={<Tag value={review.username} severity="warning" />}
        className="md:w-25rem max-w-30rem cursor-pointer card-hover"
      >
        <div className="m-0 h-6rem card-description overflow-hidden">
          {review.description}
        </div>
      </Card>
    </div>
  );
}
