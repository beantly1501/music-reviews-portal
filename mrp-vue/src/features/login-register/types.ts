export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type User = {
  username: string;
  password: string;
  email: string;
  role: Role;
};
