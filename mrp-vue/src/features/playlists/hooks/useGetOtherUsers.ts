import { type UserPartialDto, useFetch } from "@/shared";

export const useGetOtherUsers = () => {
  return useFetch<UserPartialDto[]>("/api/user/all-but-me");
};
