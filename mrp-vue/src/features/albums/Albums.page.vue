<template>
  <div class="flex flex-col gap-4 items-center">
    <Button
      v-if="user?.role === Role.ADMIN"
      label="Add New Album"
      icon="pi pi-plus"
      class="w-fit"
      @click="isDialogVisible = true"
    />

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Error loading albums: {{ error.message }}</p>
    </div>

    <div
      v-else-if="albums && albums.content.length > 0"
      class="flex flex-wrap gap-4 justify-center"
    >
      <AlbumCard
        v-for="album in albums.content"
        :key="album.id"
        :album="album"
        @review="onReviewAlbum"
        @album-click="onAlbumClick"
      />
    </div>

    <div v-else class="text-center text-gray-500">
      <p>No albums found.</p>
    </div>
  </div>

  <EditReviewDialog
    v-if="selectedAlbum"
    v-model:visible="isReviewDialogVisible"
    :name="selectedAlbum.name"
    review-type="ALBUM"
    :initial-values="{
      grade: 5,
      description: '',
      albumId: selectedAlbum.id,
    }"
    @success="onReviewSuccess"
  />

  <CreateAlbumDialog v-model="isDialogVisible" @refetchAlbums="refetchAlbums" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ProgressSpinner, Button } from "primevue";
import {
  AlbumCard,
  useGetAllAlbums,
  EditReviewDialog,
  CreateAlbumDialog,
  Role,
} from "@/features";
import type { AlbumResponseDto } from "@/shared";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const {
  data: albums,
  isLoading,
  error,
  refetch: refetchAlbums,
} = useGetAllAlbums();

const router = useRouter();

const isDialogVisible = ref(false);
const isReviewDialogVisible = ref(false);
const selectedAlbum = ref<AlbumResponseDto | null>(null);

const onReviewAlbum = (album: AlbumResponseDto) => {
  selectedAlbum.value = album;
  isReviewDialogVisible.value = true;
};

const onReviewSuccess = () => {
  refetchAlbums();
};

const onAlbumClick = (album: AlbumResponseDto) => {
  router.push(`/album/${album.id}`);
};
</script>
