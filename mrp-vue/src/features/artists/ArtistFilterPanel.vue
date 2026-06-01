<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, OverlayPanel } from "primevue";
import LazyMultiSelect from "@/shared/components/LazyMultiSelect.vue";
import { useGetAlbumsLazy, useGetSongsLazy } from "@/features";
import type { ArtistFilters } from "./hooks/useGetArtists";

const props = defineProps<{
  filters: ArtistFilters;
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  "update:filters": [ArtistFilters];
  clear: [];
}>();

const op = ref<InstanceType<typeof OverlayPanel> | null>(null);

const albums = useGetAlbumsLazy();
const songs = useGetSongsLazy();

const albumOptions = computed(() => albums.items.value.map((a) => ({ label: a.name, value: a.id })));
const songOptions = computed(() => songs.items.value.map((s) => ({ label: s.name, value: s.id })));

const albumIds = computed({
  get: () => props.filters.albumIds,
  set: (val) => emit("update:filters", { ...props.filters, albumIds: val }),
});

const songIds = computed({
  get: () => props.filters.songIds,
  set: (val) => emit("update:filters", { ...props.filters, songIds: val }),
});

const onShow = () => {
  albums.initialize();
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
    aria-label="Filter artists"
    @click="(e) => op?.toggle(e)"
  />

  <OverlayPanel ref="op" class="w-80" @show="onShow">
    <div class="flex flex-col gap-4 p-1">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-sm">Filter artists</span>
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
