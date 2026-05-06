<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold text-center">Newest Reviews</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Error loading reviews: {{ error.message }}</p>
    </div>

    <div v-else-if="reviews && reviews.length > 0" :class="isMobile ? 'flex flex-wrap gap-2 justify-center' : 'flex flex-wrap gap-4 justify-center'">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        @refetch="refetch"
      />
    </div>

    <div v-else class="text-center text-gray-500">
      <p>No reviews yet...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReviewCard } from "@/shared";
import { ProgressSpinner } from "primevue";
import { useMediaQuery } from "@vueuse/core";
import { useGetNewestReviews } from "./hooks/useGetNewestReviews";

const { data: reviews, isLoading, error, refetch } = useGetNewestReviews();
const isMobile = useMediaQuery("(max-width: 850px)");
</script>
