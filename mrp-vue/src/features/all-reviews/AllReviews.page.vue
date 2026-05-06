<template>
  <div class="flex flex-col gap-4">
    <p class="text-4xl font-bold">All Reviews</p>
    <div>
      <div class="card flex justify-center" v-if="isLoading">
        <ProgressSpinner />
      </div>

      <p v-else-if="!reviews?.length" class="text-center text-gray-500">No reviews yet...</p>

      <DataTable
        row-hover
        class="cursor-pointer"
        v-else
        :value="reviews"
        removableSort
        @row-click="onRowClick"
      >
        <Column field="name" header="Name" :sortable="true">
          <template #body="slotProps">
            {{ slotProps.data.songName || slotProps.data.albumName }}
          </template>
        </Column>
        <Column field="type" header="Type" :sortable="true">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.type === 'SONG' ? 'Song' : 'Album'"
              :severity="slotProps.data.type === 'SONG' ? 'success' : 'info'"
              rounded
            />
          </template>
        </Column>
        <Column field="username" header="Username" :sortable="true">
          <template #body="slotProps">
            <p class="font-bold">{{ slotProps.data.username }}</p>
          </template>
        </Column>
        <Column field="grade" header="Rating" :sortable="true">
          <template #body="slotProps">
            <Rating
              :model-value="slotProps.data.grade"
              readonly
              :cancel="false"
            />
          </template>
        </Column>
        <Column field="description" header="Description">
          <template #body="slotProps">
            <span class="line-clamp-2">{{ slotProps.data.description }}</span>
          </template>
        </Column>
        <Column field="creationDate" header="Last updated" :sortable="true">
          <template #body="slotProps">
            {{ new Date(slotProps.data.creationDate).toLocaleDateString('hr-HR') }}
          </template>
        </Column>
      </DataTable>
    </div>

    <ReviewDialog
      v-if="selectedReview"
      v-model:visible="showDialog"
      :key="`${selectedReview.type}-${selectedReview.id}`"
      :review-id="selectedReview.id"
      :review-type="selectedReview.type"
      @refetch="refetchReviews"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DataTable, { type DataTableRowClickEvent } from "primevue/datatable";
import Column from "primevue/column";
import Rating from "primevue/rating";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import { useGetAllReviews } from "@/features/review";
import { ReviewDialog } from "@/features/review";
import type { ReviewResponse } from "@/shared";

const { data: reviews, isLoading, refetch: refetchReviews } = useGetAllReviews();

const showDialog = ref(false);
const selectedReview = ref<ReviewResponse | null>(null);

const onRowClick = (event: DataTableRowClickEvent) => {
  selectedReview.value = event.data as ReviewResponse;
  showDialog.value = true;
};
</script>
