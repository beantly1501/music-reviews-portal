import { computed, type Ref } from "vue";
import { type UserResponseDto, useFetch } from "@/shared";

export const useGetUserById = (id: Ref<string | string[] | undefined>) => {
  const url = computed(() => (id.value ? `/api/user/${id.value}` : undefined));
  return useFetch<UserResponseDto>(url);
};
