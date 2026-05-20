<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, OverlayPanel } from "primevue";
import GenreMultiSelect from "@/shared/components/GenreMultiSelect.vue";
import LazyMultiSelect from "@/shared/components/LazyMultiSelect.vue";
import { useGetArtistsLazy } from "@/features";
import { useGetSongsLazy } from "@/features";
import type { AlbumFilters } from "./hooks/useGetAlbums";

const props = defineProps<{
  filters: AlbumFilters;
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  "update:filters": [AlbumFilters];
  clear: [];
}>();

const op = ref<InstanceType<typeof OverlayPanel> | null>(null);

const artists = useGetArtistsLazy();
const songs = useGetSongsLazy();

const artistOptions = computed(() => artists.items.value.map((a) => ({ label: a.name, value: a.id })));
const songOptions = computed(() => songs.items.value.map((s) => ({ label: s.name, value: s.id })));

const genreIds = computed({
  get: () => props.filters.genreIds,
  set: (val) => emit("update:filters", { ...props.filters, genreIds: val }),
});

const artistIds = computed({
  get: () => props.filters.artistIds,
  set: (val) => emit("update:filters", { ...props.filters, artistIds: val }),
});

const songIds = computed({
  get: () => props.filters.songIds,
  set: (val) => emit("update:filters", { ...props.filters, songIds: val }),
});

const onShow = () => {
  artists.initialize();
  songs.initialize();
};

const onClear = () => {
  emit("clear");
  op.value?.hide();
};
</script>

<template>
  <Button
    icon="pi pi-filter"
    :severity="hasActiveFilters ? 'info' : 'secondary'"
    :outlined="!hasActiveFilters"
    aria-label="Filter albums"
    @click="(e) => op?.toggle(e)"
  />

  <OverlayPanel ref="op" class="w-80" @show="onShow">
    <div class="flex flex-col gap-4 p-1">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-sm">Filter albums</span>
        <Button
          v-if="hasActiveFilters"
          label="Clear all"
          size="small"
          severity="secondary"
          text
          @click="onClear"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-400">Genre</label>
        <GenreMultiSelect v-model="genreIds" scroll-height="150px" :panel-style="{ width: '400px' }" placeholder="Any genre" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-400">Artist</label>
        <LazyMultiSelect
          v-model="artistIds"
          :options="artistOptions"
          :has-more="artists.hasMore.value"
          :loading="artists.isLoading.value"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any artist"
          @filter="artists.onFilter"
          @load-more="artists.loadMore"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-400">Song</label>
        <LazyMultiSelect
          v-model="songIds"
          :options="songOptions"
          :has-more="songs.hasMore.value"
          :loading="songs.isLoading.value"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any song"
          @filter="songs.onFilter"
          @load-more="songs.loadMore"
        />
      </div>
    </div>
  </OverlayPanel>
</template>
