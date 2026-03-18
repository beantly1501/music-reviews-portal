import { computed, type Ref } from "vue";
import { type ReviewResponse, useFetch } from "@/shared";

export const useGetReviewsByUserId = (id: Ref<string | string[] | undefined>) => {
  const url = computed(() => (id.value ? `/api/reviews/user/${id.value}` : undefined));
  return useFetch<ReviewResponse[]>(url);
};
