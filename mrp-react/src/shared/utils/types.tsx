import { z } from "zod";
import { UserRoleEnum } from "./enums.tsx";

export type SongType = {
  id: number;
  name: string;
  imageUrl?: string;
  link?: string;
  fileUrl?: string;
  genres?: GenreType[];
  albums?: AlbumType[];
  artists?: ArtistType[];
  year: number;
  grade?: number;
  averageRating?: number;
};

export type AlbumType = {
  id: number;
  name: string;
  imageUrl?: string;
  link?: string;
  songs?: SongType[];
  genres?: GenreType[];
  artists?: ArtistType[];
  year: number;
  grade?: number;
  averageRating?: number;
};

export type ArtistType = {
  id: number;
  name: string;
  imageUrl?: string;
  description: string;
  albums?: AlbumType[];
  songs?: SongType[];
};

export type GenreType = {
  id: number;
  name: string;
};

export const songCreateSchema = z.object({
  name: z.string().min(1, { message: "Song name is required." }),
  cover: z.instanceof(File).optional(),
  link: z.string().optional(),
  file: z.instanceof(File).optional(),
  year: z
    .number({ error: "Year must be a number." })
    .int()
    .max(new Date().getFullYear(), {
      message: `Year cannot exceed ${new Date().getFullYear()}.`,
    }),
});
export type SongCreateForm = z.infer<typeof songCreateSchema>;

export const albumCreateSchema = z.object({
  name: z.string().min(1, "Album name is required."),
  link: z.url("Link must be a valid URL.").optional(),
  year: z
    .number({ error: "Year must be a number." })
    .int("Year must be an integer.")
    .positive("Year must be positive."),
  cover: z
    .instanceof(File, { message: "Cover must be a valid file." })
    .optional(),
});

export type AlbumCreateForm = z.infer<typeof albumCreateSchema>;

export type UserInfoType = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: UserRoleEnum;
};

// --- auth-related schemas & types ---
export const loginSchema = z.object({
  username: z.string().nonempty({ message: "Username is required." }),
  password: z.string().nonempty({ message: "Password is required." }),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().nonempty({ message: "Username is required." }),
  password: z.string().nonempty({ message: "Password is required." }),
  email: z.email({ message: "Valid email is required." }),
  role: z.enum(["USER", "ADMIN"], { error: "Role is required" }),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export type ReviewResponse = {
  type: "SONG" | "ALBUM";
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

export const songReviewSchema = z.object({
  songId: z.number(),
  grade: z
    .number()
    .min(1, "Grade is required.")
    .max(5, "Grade must be between 1 and 5."),
  description: z.string().min(1, "Description is required."),
});
export type SongReviewFormData = z.infer<typeof songReviewSchema>;

export const albumReviewSchema = z.object({
  albumId: z.number(),
  grade: z
    .number()
    .min(1, "Grade is required.")
    .max(5, "Grade must be between 1 and 5."),
  description: z.string().min(1, "Description is required."),
});
export type AlbumReviewFormData = z.infer<typeof albumReviewSchema>;

export const artistCreateSchema = z.object({
  name: z.string().min(1, { message: "Artist name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  image: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Invalid file type",
    }),
});
export type ArtistCreateForm = z.infer<typeof artistCreateSchema>;

export type PlaylistType = {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  isPrivate: boolean;
  ownerId: number;
  ownerUsername: string;
  songs: SongType[];
  collaborators: UserOption[];
};

export const playlistCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(2000).optional().nullable(),
  isPrivate: z.boolean(),
  image: z
    .any()
    .refine((v) => v == null || v instanceof File, "Invalid file")
    .optional()
    .nullable(),
});
export type PlaylistCreateForm = z.infer<typeof playlistCreateSchema>;

export type UserOption = { id: number; username: string };

export type SongRequestData = {
  songId?: number;
  formData: SongCreateForm;
  albumIds: number[];
  artistIds: number[];
  genreIds: number[];
};

export type AlbumRequestData = {
  albumId?: number;
  formData: AlbumCreateForm;
  songIds: number[];
  artistIds: number[];
};

export type ArtistRequestData = {
  artistId?: number;
  formData: ArtistCreateForm;
  songIds: number[];
  albumIds: number[];
};

export type PlaylistRequestData = {
  playlistId?: number;
  formData: PlaylistCreateForm;
  songIds: number[];
  collaboratorIds: number[];
};

export type Options = {
  page?: number;
  size?: number;
  sort?: string | string[];
};

export type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};
