<template>
  <div class="flex flex-col gap-4 items-center">
    <div class="w-full flex items-center justify-center gap-3 flex-wrap">
      <Button
        v-if="user?.role === Role.ADMIN"
        label="Add New Artist"
        icon="pi pi-plus"
        class="w-fit shrink-0"
        @click="isDialogVisible = true"
      />

      <div class="flex gap-2 w-full max-w-md">
        <IconField icon-position="left" class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            :value="search"
            placeholder="Search artists…"
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
        <ArtistFilterPanel
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
        <ArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
          @artist-click="onArtistClick"
        />
      </div>

      <div v-if="artists.length === 0" class="text-gray-500">No artists found.</div>

      <div ref="sentinelRef" class="w-full flex justify-center py-6">
        <ProgressSpinner v-if="isLoadingMore" style="width: 2rem; height: 2rem" />
      </div>
    </template>
  </div>

  <CreateArtistDialog v-model="isDialogVisible" @refetchArtists="refetch" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ProgressSpinner, Button, InputText, IconField, InputIcon } from "primevue";
import { useMediaQuery } from "@vueuse/core";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";
import type { ArtistResponseDto } from "@/shared";
import ArtistCard from "./ArtistCard.vue";
import CreateArtistDialog from "./CreateArtistDialog.vue";
import ArtistFilterPanel from "./ArtistFilterPanel.vue";
import { useGetArtists } from "./hooks/useGetArtists";
import { Role } from "@/features";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const isMobile = useMediaQuery("(max-width: 850px)");

const {
  artists,
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
} = useGetArtists();

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

const onArtistClick = (artist: ArtistResponseDto) => {
  router.push(`/artist/${artist.id}`);
};
</script>
