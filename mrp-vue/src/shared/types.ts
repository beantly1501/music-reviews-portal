import { z } from "zod";

const thisYear = new Date().getFullYear();

export type MultiSelectOptionType = {
  label: string;
  value: number;
};

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

export const songCreateSchema = z.object({
  name: z.string().min(1, { message: "Song name is required." }),
  cover: z.instanceof(File).optional(),
  file: z.instanceof(File).optional(),

  link: z.string().url("Link must be a valid URL.").optional(),

  year: z.number().int().max(thisYear).optional(),

  albumIds: z.array(z.number()).default([]).optional(),
  genreIds: z.array(z.number()).default([]).optional(),
  artistIds: z.array(z.number()).default([]).optional(),
});

export type SongCreateForm = z.infer<typeof songCreateSchema>;

export interface AlbumPartialDto {
  id: number;
  name: string;
}

export interface ArtistPartialDto {
  id: number;
  name: string;
}

export interface GenrePartialDto {
  id: number;
  name: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SongResponse {
  id: number;
  name: string;
  imageUrl: string;
  fileUrl: string;
  link: string;
  year: number;
  albums: AlbumPartialDto[];
  artists: ArtistPartialDto[];
  genres: GenrePartialDto[];
  grade: number;
  averageRating: number;
}

export interface SongPartialDto {
  id: number;
  name: string;
  imageUrl: string;
  fileUrl: string;
  link: string;
  year: number;
}

export interface GenreResponseDto {
  id: number;
  name: string;
  songs: SongPartialDto[];
}

export const songReviewSchema = z.object({
  songId: z.number(),
  grade: z.number().min(1, { message: "Grade must be at least 1." }),
  description: z.string().min(1, { message: "Description is required." }),
});

export type SongReviewForm = z.infer<typeof songReviewSchema>;

export const albumReviewSchema = z.object({
  albumId: z.number(),
  grade: z.number().min(1, { message: "Grade must be at least 1." }),
  description: z.string().min(1, { message: "Description is required." }),
});

export type AlbumReviewForm = z.infer<typeof albumReviewSchema>;

export const songCreateDefaultValues: SongCreateForm = {
  name: "",
  cover: undefined,
  file: undefined,
  link: undefined,
  year: new Date(Date.now()).getFullYear(),
  albumIds: [],
  genreIds: [],
  artistIds: [],
};
