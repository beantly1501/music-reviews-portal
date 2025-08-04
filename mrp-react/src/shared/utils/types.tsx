import { SongOrAlbumEnum } from "./enums.tsx";
import { z } from "zod";

export type ReviewCardType = {
  id: number;
  name: string;
  image: string; // base64 string
  date: string;
  description: string;
  songOrAlbum: SongOrAlbumEnum;
  rating: number;
  username: string;
};

export type SongType = {
  id: number;
  name: string;
  cover?: string;
  link?: string;
  file?: string;
  year: number;
};

export const songCreateSchema = z.object({
  name: z.string().nonempty({ message: "Song name is required" }),
  cover: z.instanceof(File).optional(),
  link: z.string().optional(),
  file: z.instanceof(File).optional(),
  year: z
    .number({ error: "Year must be a number" })
    .int()
    .min(0, { message: "Year is too small" })
    .max(new Date().getFullYear(), {
      message: `Year cannot exceed ${new Date().getFullYear()}`,
    }),
});
export type SongCreateForm = z.infer<typeof songCreateSchema>;

export type UserInfo = {
  username: string;
  email: string;
};

// --- auth-related schemas & types ---
export const loginSchema = z.object({
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  email: z.email({ message: "Valid email is required" }),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export type ReviewResponse = {
  type: "SONG" | "ALBUM";
  id: number;
  songId?: number;
  albumId?: number;
  username: string;
  grade: number;
  description: string;
  creationDate: string;
};
