<template>
  <div class="flex flex-col items-center gap-15">
    <UserInfo />

    <div class="flex flex-col w-full gap-4">
      <p class="flex justify-start text-4xl font-bold">My reviews</p>

      <DataTable
        v-if="myReviews?.length"
        :loading="isLoadingReviews"
        :value="myReviews"
        removableSort
        selectionMode="single"
        class="cursor-pointer"
        @row-click="(e) => openReviewDialog(e.data)"
      >
        <Column field="name" header="Name" :sortable="true">
          <template #body="{ data }: { data: ReviewResponse }">
            <div>
              {{
                data.type === ReviewType.SONG ? data.songName : data.albumName
              }}
            </div>
          </template>
        </Column>

        <Column field="type" header="Type" :sortable="true">
          <template #body="{ data }: { data: ReviewResponse }">
            <Tag
              :value="data.type === ReviewType.SONG ? 'Song' : 'Album'"
              :severity="data.type === ReviewType.ALBUM ? 'info' : 'success'"
            />
          </template>
        </Column>

        <Column field="rating" header="Rating" :sortable="true">
          <template #body="{ data }: { data: ReviewResponse }">
            <Rating :modelValue="data.grade" readonly />
          </template>
        </Column>

        <Column field="description" header="Description" />
        <Column field="creationDate" header="Creation date" :sortable="true">
          <template #body="{ data }: { data: ReviewResponse }">
            <div>
              {{ new Date(data.creationDate).toLocaleDateString("hr-HR") }}
            </div>
          </template>
        </Column>
      </DataTable>

      <p v-else-if="!isLoadingReviews" class="text-gray-400">No reviews yet.</p>
    </div>

    <ReviewDialog
      v-model:visible="isReviewDialogVisible"
      :review-id="selectedReview?.id"
      :review-type="selectedReview?.type"
      @refetch="refetchMyReviews"
    />

    <div class="flex flex-col w-full gap-4">
      <div class="flex justify-between items-center">
        <p class="flex justify-start text-4xl font-bold">My playlists</p>
        <p v-if="myPlaylists?.totalElements">{{ myPlaylists.totalElements }} total</p>
      </div>

      <DataTable
        v-if="myPlaylists?.content?.length"
        :loading="isLoadingPlaylists"
        :value="myPlaylists?.content"
        removableSort
        selectionMode="single"
        @row-click="
          (e) =>
            router.push({ name: 'playlist-details', params: { id: e.data.id } })
        "
        class="cursor-pointer"
      >
        <Column field="name" header="Name" :sortable="true" />
        <Column field="isPrivate" header="Visibility" :sortable="true">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            <Tag
              :value="data.isPrivate ? 'Private' : 'Public'"
              :severity="data.isPrivate ? 'danger' : 'success'"
            />
          </template>
        </Column>
        <Column field="ownerUsername" header="Owner" :sortable="true" />
        <Column field="songs" header="Songs" :sortable="true">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            {{ data.songs.length }}
          </template>
        </Column>
        <Column field="collaborators" header="Collaborators" :sortable="true">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            {{ data.collaborators.length }}
          </template>
        </Column>
        <Column field="description" header="Description">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            <div>{{ data.description ?? "-" }}</div>
          </template>
        </Column>
      </DataTable>

      <p v-else-if="!isLoadingPlaylists" class="text-gray-400">No playlists yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import UserInfo from "./UserInfo.vue";
import { useRouter } from "vue-router";
import { useGetMyReviews, useGetMyPlaylists } from "@/features/profile/hooks";
import {
  type ReviewResponse,
  ReviewType,
  type PlaylistResponseDto,
} from "@/shared";
import { Tag, Rating } from "primevue";
import ReviewDialog from "@/features/review/ReviewDialog.vue";

const router = useRouter();
const {
  isLoading: isLoadingReviews,
  data: myReviews,
  refetch: refetchMyReviews,
} = useGetMyReviews();
const { isLoading: isLoadingPlaylists, data: myPlaylists } =
  useGetMyPlaylists();

const isReviewDialogVisible = ref(false);
const selectedReview = ref<ReviewResponse | null>(null);

const openReviewDialog = (review: ReviewResponse) => {
  selectedReview.value = review;
  isReviewDialogVisible.value = true;
};
</script>
