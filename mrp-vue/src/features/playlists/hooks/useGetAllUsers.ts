import { type UserPartialDto, useFetch } from "@/shared";

export const useGetAllUsers = () => {
  return useFetch<UserPartialDto[]>("/api/user/all");
};
