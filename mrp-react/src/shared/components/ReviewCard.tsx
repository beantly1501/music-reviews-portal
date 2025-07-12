import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

import { SongOrAlbumEnum } from "@shared/utils";
import { ReviewType } from "@shared/utils";
import { formatDate } from "@shared/utils";

interface Props {
  review: ReviewType;
}

export default function ReviewCard({ review }: Props) {
  const header = (
    <img
      className="overflow-y-hidden"
      style={{ maxHeight: "250px", objectFit: "cover" }}
      alt="cat"
      src={review.image}
    />
  );

  return (
    <div className="card flex justify-content-center">
      <Card
        title={review.name}
        subTitle={
          <div className="flex gap-3">
            <Tag value={formatDate(review.date)} severity="info" />
            <Tag
              value={
                review.songOrAlbum === SongOrAlbumEnum.SONG ? "Song" : "Album"
              }
              severity={
                review.songOrAlbum === SongOrAlbumEnum.SONG ? "success" : "info"
              }
            />
          </div>
        }
        header={header}
        className="md:w-25rem cursor-pointer card-hover"
      >
        <p className="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore
          sed consequuntur error repudiandae numquam deserunt quisquam repellat
          libero asperiores earum nam nobis, culpa ratione quam perferendis
          esse, cupiditate neque quas!
        </p>
      </Card>
    </div>
  );
}
