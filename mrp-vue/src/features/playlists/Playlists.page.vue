<template>
  <div class="flex flex-col gap-4 items-center">
    <div class="w-full flex items-center justify-center gap-3 flex-wrap">
      <Button
        label="Add New Playlist"
        icon="pi pi-plus"
        class="w-fit shrink-0"
        @click="isDialogVisible = true"
      />

      <div class="flex gap-2 w-full max-w-md">
        <IconField icon-position="left" class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            :value="search"
            placeholder="Search playlists…"
            class="w-full"
            @input="(e) => onSearchChange((e.target as HTMLInputElement).value)"
          />
        </IconField>
        <Button
          v-if="search.length > 0"
          icon="pi pi-times"
          severity="secondary"
          outlined
          aria-label="Clear search"
          @click="clearSearch"
        />
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <template v-else>
      <div v-if="error" class="text-center text-red-500">
        <p>Error loading playlists: {{ error.message }}</p>
      </div>

      <div
        v-else-if="playlists.length > 0"
        :class="isMobile ? 'flex flex-wrap gap-2 justify-center' : 'flex flex-wrap gap-4 justify-center'"
      >
        <PlaylistCard
          v-for="playlist in playlists"
          :key="playlist.id"
          :playlist="playlist"
          @playlist-click="onPlaylistClick"
        />
      </div>

      <div v-else class="text-center text-gray-500">
        <p>No playlists found.</p>
      </div>

      <div ref="sentinelRef" class="w-full flex justify-center py-6">
        <ProgressSpinner v-if="isLoadingMore" style="width: 2rem; height: 2rem" />
      </div>
    </template>
  </div>

  <CreatePlaylistDialog v-model="isDialogVisible" @refetchPlaylists="refetch" />
</template>

<script setup lang="ts">
import type { PlaylistResponseDto } from "@/shared";
import { Button, ProgressSpinner, InputText, IconField, InputIcon } from "primevue";
import { useMediaQuery } from "@vueuse/core";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import CreatePlaylistDialog from "./CreatePlaylistDialog.vue";
import { useGetPlaylists } from "./hooks/useGetPlaylists";
import PlaylistCard from "./PlaylistCard.vue";

const {
  playlists,
  isLoading,
  isLoadingMore,
  error,
  search,
  hasMore,
  onSearchChange,
  clearSearch,
  loadMore,
  refetch,
} = useGetPlaylists();

const isMobile = useMediaQuery("(max-width: 850px)");
const router = useRouter();
const isDialogVisible = ref(false);
const sentinelRef = ref<HTMLDivElement | null>(null);

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (observer) observer.disconnect();
  if (!sentinelRef.value || !hasMore.value || isLoadingMore.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { threshold: 0.1 },
  );
  observer.observe(sentinelRef.value);
};

onMounted(() => {
  watch([hasMore, isLoadingMore, sentinelRef], setupObserver, { immediate: true });
});

onUnmounted(() => observer?.disconnect());

const onPlaylistClick = (playlist: PlaylistResponseDto) => {
  router.push(`/playlist/${playlist.id}`);
};
</script>
