<template>
  <div class="flex flex-col gap-4 items-center">
    <Button
      v-if="user?.role === Role.ADMIN"
      label="Add New Artist"
      icon="pi pi-plus"
      class="w-fit"
      @click="isDialogVisible = true"
    />

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Error loading artists: {{ error.message }}</p>
    </div>

    <div
      v-else-if="artists && artists.length > 0"
      :class="isMobile ? 'flex flex-wrap gap-2 justify-center' : 'flex flex-wrap gap-4 justify-center'"
    >
      <ArtistCard
        v-for="artist in artists"
        :key="artist.id"
        :artist="artist"
        @artist-click="onArtistClick"
      />
    </div>

    <div v-else class="text-center text-gray-500">
      <p>No artists found.</p>
    </div>
  </div>

  <CreateArtistDialog v-model="isDialogVisible" @refetchArtists="refetchArtists" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ProgressSpinner, Button } from "primevue";
import { useMediaQuery } from "@vueuse/core";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";
import type { ArtistResponseDto } from "@/shared";
import ArtistCard from "./ArtistCard.vue";
import CreateArtistDialog from "./CreateArtistDialog.vue";
import { useGetAllArtists } from "./hooks/useGetAllArtists";
import { Role } from "@/features";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const isMobile = useMediaQuery("(max-width: 850px)");

const {
  data: artists,
  isLoading,
  error,
  refetch: refetchArtists,
} = useGetAllArtists();

const router = useRouter();
const isDialogVisible = ref(false);

const onArtistClick = (artist: ArtistResponseDto) => {
  router.push(`/artist/${artist.id}`);
};
</script>
