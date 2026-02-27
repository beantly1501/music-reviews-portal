import { type ReviewResponse, useFetch } from "@/shared";

export const useGetNewestReviews = () => {
  return useFetch<ReviewResponse[]>("/api/reviews/newest");
};
