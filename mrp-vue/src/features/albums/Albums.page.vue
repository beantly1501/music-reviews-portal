<template>
  <div class="flex flex-col gap-4 items-center">
    <div class="w-full flex items-center justify-center gap-3 flex-wrap">
      <Button
        v-if="user?.role === Role.ADMIN"
        label="Add New Album"
        icon="pi pi-plus"
        class="w-fit shrink-0"
        @click="isDialogVisible = true"
      />

      <div class="flex gap-2 w-full max-w-md">
        <IconField icon-position="left" class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            :value="search"
            placeholder="Search albums…"
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
        <AlbumFilterPanel
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
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :album="album"
          @review="onReviewAlbum"
          @album-click="onAlbumClick"
        />
      </div>

      <div v-if="albums.length === 0" class="text-gray-500">No albums found.</div>

      <div ref="sentinelRef" class="w-full flex justify-center py-6">
        <ProgressSpinner v-if="isLoadingMore" style="width: 2rem; height: 2rem" />
      </div>
    </template>
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
    @success="refetch"
  />

  <CreateAlbumDialog v-model="isDialogVisible" @refetchAlbums="refetch" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Button, ProgressSpinner, InputText, IconField, InputIcon } from "primevue";
import { useMediaQuery } from "@vueuse/core";
import { AlbumCard, EditReviewDialog, CreateAlbumDialog, Role } from "@/features";
import type { AlbumResponseDto } from "@/shared";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";
import { useGetAlbums } from "./hooks/useGetAlbums";
import AlbumFilterPanel from "./AlbumFilterPanel.vue";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const isMobile = useMediaQuery("(max-width: 850px)");

const {
  albums,
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
} = useGetAlbums();

const router = useRouter();

const isDialogVisible = ref(false);
const isReviewDialogVisible = ref(false);
const selectedAlbum = ref<AlbumResponseDto | null>(null);
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

const onReviewAlbum = (album: AlbumResponseDto) => {
  selectedAlbum.value = album;
  isReviewDialogVisible.value = true;
};

const onAlbumClick = (album: AlbumResponseDto) => {
  router.push(`/album/${album.id}`);
};
</script>
