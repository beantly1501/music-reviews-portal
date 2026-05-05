<template>
  <div class="flex flex-col items-center gap-15">
    <div v-if="isLoadingUser" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <template v-else-if="userData">
      <div class="flex justify-end w-full">
        <Button icon="pi pi-arrow-left" label="Back" outlined @click="router.go(-1)" />
      </div>
      <Card class="max-w-[400px] w-full mt-10">
        <template #content>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <span class="font-bold w-8rem">Username:</span>
              <span>{{ userData.username }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold w-8rem">Email:</span>
              <span>{{ userData.email }}</span>
            </div>
          </div>
        </template>
      </Card>

      <div class="flex flex-col w-full gap-4">
        <p class="flex justify-start text-4xl font-bold">Reviews</p>

        <DataTable
          :loading="isLoadingReviews"
          :value="userReviews ?? []"
          removableSort
        >
          <Column field="name" header="Name" :sortable="true">
            <template #body="{ data }: { data: ReviewResponse }">
              {{ data.type === ReviewType.SONG ? data.songName : data.albumName }}
            </template>
          </Column>
          <Column field="type" header="Type" :sortable="true">
            <template #body="{ data }: { data: ReviewResponse }">
              <Tag :value="data.type" />
            </template>
          </Column>
          <Column field="grade" header="Rating" :sortable="true">
            <template #body="{ data }: { data: ReviewResponse }">
              <Rating :modelValue="data.grade" readonly />
            </template>
          </Column>
          <Column field="description" header="Description" />
          <Column field="creationDate" header="Date" :sortable="true">
            <template #body="{ data }: { data: ReviewResponse }">
              {{ new Date(data.creationDate).toLocaleDateString("hr-HR") }}
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="flex flex-col w-full gap-4">
        <div class="flex justify-between items-center">
          <p class="flex justify-start text-4xl font-bold">Public Playlists</p>
          <p>{{ userPlaylists?.totalElements }} total</p>
        </div>

        <DataTable
          v-if="userPlaylists?.content.length && userPlaylists?.content.length > 0"
          :loading="isLoadingPlaylists"
          :value="userPlaylists?.content ?? []"
          removableSort
          selectionMode="single"
          class="cursor-pointer"
          @row-click="(e) => router.push({ name: 'playlist-details', params: { id: e.data.id } })"
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
          <Column field="songs" header="Songs">
            <template #body="{ data }: { data: PlaylistResponseDto }">
              {{ data.songs.length }}
            </template>
          </Column>
          <Column field="description" header="Description">
            <template #body="{ data }: { data: PlaylistResponseDto }">
              {{ data.description ?? '-' }}
            </template>
          </Column>
        </DataTable>
        <p v-else class="text-gray-500">No public playlists found.</p>
      </div>
    </template>

    <div v-else class="text-center text-red-500 mt-10">
      <p>User not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Card, ProgressSpinner, Tag, Rating, Button } from "primevue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { ReviewResponse, PlaylistResponseDto } from "@/shared";
import { ReviewType } from "@/shared";
import {
  useGetUserById,
  useGetReviewsByUserId,
  useGetPublicPlaylistsByUserId,
} from "./hooks";

const route = useRoute();
const router = useRouter();

const userId = computed(() => route.params.id);

const { data: userData, isLoading: isLoadingUser } = useGetUserById(userId);
const { data: userReviews, isLoading: isLoadingReviews } = useGetReviewsByUserId(userId);
const { data: userPlaylists, isLoading: isLoadingPlaylists } = useGetPublicPlaylistsByUserId(userId);
</script>
