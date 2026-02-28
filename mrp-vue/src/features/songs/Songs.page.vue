<template>
  <div class="flex flex-col gap-4 items-center">
    <Button
      v-if="user?.role === Role.ADMIN"
      label="Add New Song"
      icon="pi pi-plus"
      class="w-fit"
      @click="isDialogVisible = true"
    />
    <div class="flex flex-wrap gap-4">
      <SongCard
        v-for="song in songs"
        :key="song.id"
        :song="song"
        @review="onReviewSong"
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
import { Button } from "primevue";
import { CreateSongDialog, EditReviewDialog, Role, SongCard } from "@/features";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useGetAllSongs } from "@/features";
import type { SongResponse } from "@/shared";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { data: songs, refetch: refetchSongs } = useGetAllSongs();

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
</script>
