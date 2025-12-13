export const ReviewType = {
  SONG: "SONG",
  ALBUM: "ALBUM",
} as const;

export type ReviewType = (typeof ReviewType)[keyof typeof ReviewType];

export type ReviewResponse = {
  type: ReviewType;
  id: number;
  songId?: number;
  songName?: string;
  albumName?: string;
  albumId?: number;
  userId: number;
  username: string;
  grade: number;
  description: string;
  creationDate: string;
  image: string;
};
