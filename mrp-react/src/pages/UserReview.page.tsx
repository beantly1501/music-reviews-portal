import { useLocation } from "react-router-dom";
import { SongOrAlbumEnum } from "../shared/utils/enums.tsx";

export default function UserReviewPage() {
  const location = useLocation();

  return (
    <div>
      <p>name: {location.state.review.name}</p>
      <div>
        image:{" "}
        <img className="w-4rem" src={location.state.review.image} alt="x" />
      </div>
      <p>rating: {location.state.review.rating}</p>
      <p>
        songOrAlbum:{" "}
        {location.state.review.songOrAlbum === SongOrAlbumEnum.SONG
          ? "SONG"
          : "ALBUM"}
      </p>
      <p>username: {location.state.review.username}</p>
    </div>
  );
}
