import { SongOrAlbumEnum } from "./enums.tsx";

export type ReviewType = {
  id: number;
  name: string;
  image: string; // base64 string
  date: string;
  songOrAlbum: SongOrAlbumEnum;
  rating: number;
  username: string;
};
