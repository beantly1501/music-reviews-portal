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
      <SongCard v-for="song in songs" :key="song.id" :song="song" />
    </div>
  </div>

  <CreateSongDialog v-model="isDialogVisible" />
</template>
<script setup lang="ts">
import { useAuthStore } from "@/shared";
import { Button } from "primevue";
import { CreateSongDialog, Role, SongCard } from "@/features";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useGetAllSongs } from "./hooks/useGetAllSongs";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { data: songs } = useGetAllSongs();

const isDialogVisible = ref(false);
</script>
