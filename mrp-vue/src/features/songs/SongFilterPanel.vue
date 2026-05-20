<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, OverlayPanel } from "primevue";
import GenreMultiSelect from "@/shared/components/GenreMultiSelect.vue";
import LazyMultiSelect from "@/shared/components/LazyMultiSelect.vue";
import { useGetArtistsLazy } from "@/features";
import { useGetAlbumsLazy } from "@/features";
import type { SongFilters } from "./hooks/useGetSongs";

const props = defineProps<{
  filters: SongFilters;
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  "update:filters": [SongFilters];
  clear: [];
}>();

const op = ref<InstanceType<typeof OverlayPanel> | null>(null);

const artists = useGetArtistsLazy();
const albums = useGetAlbumsLazy();

const artistOptions = computed(() => artists.items.value.map((a) => ({ label: a.name, value: a.id })));
const albumOptions = computed(() => albums.items.value.map((a) => ({ label: a.name, value: a.id })));

const genreIds = computed({
  get: () => props.filters.genreIds,
  set: (val) => emit("update:filters", { ...props.filters, genreIds: val }),
});

const artistIds = computed({
  get: () => props.filters.artistIds,
  set: (val) => emit("update:filters", { ...props.filters, artistIds: val }),
});

const albumIds = computed({
  get: () => props.filters.albumIds,
  set: (val) => emit("update:filters", { ...props.filters, albumIds: val }),
});

const onShow = () => {
  artists.initialize();
  albums.initialize();
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
    aria-label="Filter songs"
    @click="(e) => op?.toggle(e)"
  />

  <OverlayPanel ref="op" class="w-80" @show="onShow">
    <div class="flex flex-col gap-4 p-1">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-sm">Filter songs</span>
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
        <label class="text-xs text-gray-400">Album</label>
        <LazyMultiSelect
          v-model="albumIds"
          :options="albumOptions"
          :has-more="albums.hasMore.value"
          :loading="albums.isLoading.value"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any album"
          @filter="albums.onFilter"
          @load-more="albums.loadMore"
        />
      </div>
    </div>
  </OverlayPanel>
</template>
