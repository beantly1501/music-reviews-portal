<template>
  <div class="flex flex-col gap-4 items-center">
    <Button
      label="Add New Playlist"
      icon="pi pi-plus"
      class="w-fit"
      @click="isDialogVisible = true"
    />

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Error loading playlists: {{ error.message }}</p>
    </div>

    <div
      v-else-if="playlists && playlists.content.length > 0"
      class="flex flex-wrap gap-4 justify-center"
    >
      <PlaylistCard
        v-for="playlist in playlists.content"
        :key="playlist.id"
        :playlist="playlist"
        @playlist-click="onPlaylistClick"
      />
    </div>

    <div v-else class="text-center text-gray-500">
      <p>No playlists found.</p>
    </div>
  </div>

  <CreatePlaylistDialog v-model="isDialogVisible" @refetchPlaylists="refetchPlaylists" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ProgressSpinner, Button } from "primevue";
import type { PlaylistResponseDto } from "@/shared";
import PlaylistCard from "./PlaylistCard.vue";
import CreatePlaylistDialog from "./CreatePlaylistDialog.vue";
import { useGetPublicPlaylists } from "./hooks/useGetAllPlaylists";

const {
  data: playlists,
  isLoading,
  error,
  refetch: refetchPlaylists,
} = useGetPublicPlaylists();

const router = useRouter();
const isDialogVisible = ref(false);

const onPlaylistClick = (playlist: PlaylistResponseDto) => {
  router.push(`/playlist/${playlist.id}`);
};
</script>
