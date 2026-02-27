import { type ReviewResponse, useFetch } from "@/shared";

export const useGetAllReviews = () => {
  return useFetch<ReviewResponse[]>("/api/reviews/all", { immediate: true });
};
