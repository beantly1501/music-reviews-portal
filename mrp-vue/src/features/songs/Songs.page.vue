<template>
  <div class="flex flex-col gap-4 items-center">
    <div class="w-full flex items-center justify-center gap-3 flex-wrap">
      <Button
        v-if="user?.role === Role.ADMIN"
        label="Add New Song"
        icon="pi pi-plus"
        class="w-fit shrink-0"
        @click="isDialogVisible = true"
      />

      <div class="flex gap-2 w-full max-w-md">
        <IconField icon-position="left" class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            :value="search"
            placeholder="Search songs…"
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
        <SongFilterPanel
          :filters="filters"
          :has-active-filters="hasActiveFilters"
          @update:filters="onFiltersChange"
          @clear="clearFilters"
        />
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>

    <template v-else>
      <div
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

      <div v-if="songs.length === 0" class="text-gray-500">No songs found.</div>

      <div ref="sentinelRef" class="w-full flex justify-center py-6">
        <ProgressSpinner v-if="isLoadingMore" style="width: 2rem; height: 2rem" />
      </div>
    </template>
  </div>

  <CreateSongDialog v-model="isDialogVisible" @refetchSongs="refetch" />

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
    @success="refetch"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from "@/shared";
import { Button, ProgressSpinner, InputText, IconField, InputIcon } from "primevue";
import { CreateSongDialog, EditReviewDialog, Role, SongCard } from "@/features";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useGetSongs } from "./hooks/useGetSongs";
import SongFilterPanel from "./SongFilterPanel.vue";
import type { SongResponse } from "@/shared";
import { useMediaQuery } from "@vueuse/core";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const {
  songs,
  isLoading,
  isLoadingMore,
  search,
  filters,
  hasActiveFilters,
  hasMore,
  onSearchChange,
  onFiltersChange,
  clearSearch,
  clearFilters,
  loadMore,
  refetch,
} = useGetSongs();

const router = useRouter();
const isMobile = useMediaQuery("(max-width: 850px)");

const isDialogVisible = ref(false);
const isReviewDialogVisible = ref(false);
const selectedSong = ref<SongResponse | null>(null);
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

const onReviewSong = (song: SongResponse) => {
  selectedSong.value = song;
  isReviewDialogVisible.value = true;
};

const onSongClick = (song: SongResponse) => {
  router.push(`/song/${song.id}`);
};
</script>
