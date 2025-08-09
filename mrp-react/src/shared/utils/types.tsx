import { z } from "zod";

export type SongType = {
  id: number;
  name: string;
  cover?: string;
  link?: string;
  file?: string;
  genres?: GenreType[];
  year: number;
  reviewed: boolean;
  grade?: number;
};

export type AlbumType = {
  id: number;
  name: string;
  cover?: string;
  link?: string;
  year: number;
  reviewed: boolean;
};

export type ArtistType = {
  id: number;
  name: string;
  image?: string;
  description: string;
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
  genreIds: z.array(z.number().int().positive()).optional(),
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

export type UserInfo = {
  username: string;
  email: string;
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
});
export type RegisterForm = z.infer<typeof registerSchema>;

export type ReviewResponse = {
  type: "SONG" | "ALBUM";
  id: number;
  songId?: number;
  songName?: string;
  albumName?: string;
  albumId?: number;
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
