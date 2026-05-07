<template>
  <div class="flex flex-col gap-4 items-center">
    <Button
      v-if="user?.role === Role.ADMIN"
      label="Add New Song"
      icon="pi pi-plus"
      class="w-fit"
      @click="isDialogVisible = true"
    />
    <div v-if="isLoading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>
    <div
      v-else
      :class="
        isMobile
          ? 'flex flex-wrap gap-2 justify-center'
          : 'flex flex-wrap gap-4 justify-center'
      "
    >
      <SongCard
        v-for="song in songs"
        :key="song.id"
        :song="song"
        @review="onReviewSong"
        @song-click="onSongClick"
      />
    </div>
  </div>

  <CreateSongDialog v-model="isDialogVisible" @refetchSongs="refetchSongs" />

  <EditReviewDialog
    v-if="selectedSong"
    v-model:visible="isReviewDialogVisible"
    :name="selectedSong.name"
    review-type="SONG"
    :initial-values="{
      grade: 5,
      description: '',
      songId: selectedSong.id,
    }"
    @success="onReviewSuccess"
  />
</template>
<script setup lang="ts">
import { useAuthStore } from "@/shared";
import { Button, ProgressSpinner } from "primevue";
import { CreateSongDialog, EditReviewDialog, Role, SongCard } from "@/features";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGetAllSongs } from "@/features";
import type { SongResponse } from "@/shared";
import { useMediaQuery } from "@vueuse/core";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { data: songs, isLoading, refetch: refetchSongs } = useGetAllSongs();

const router = useRouter();

const isMobile = useMediaQuery("(max-width: 850px)");

const isDialogVisible = ref(false);
const isReviewDialogVisible = ref(false);
const selectedSong = ref<SongResponse | null>(null);

const onReviewSong = (song: SongResponse) => {
  selectedSong.value = song;
  isReviewDialogVisible.value = true;
};

const onReviewSuccess = () => {
  refetchSongs();
};

const onSongClick = (song: SongResponse) => {
  router.push(`/song/${song.id}`);
};
</script>
