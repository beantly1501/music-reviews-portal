import { type ReviewResponse, useFetch } from "@/shared";

export const useGetMyReviews = () => {
  return useFetch<ReviewResponse[]>("/api/reviews/mine");
};
