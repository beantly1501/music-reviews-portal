import { SongOrAlbumEnum } from "./enums.tsx";

export type ReviewType = {
  id: number;
  name: string;
  image: string; // base64 string
  date: string;
  description: string;
  songOrAlbum: SongOrAlbumEnum;
  rating: number;
  username: string;
};
