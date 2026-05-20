<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, OverlayPanel } from "primevue";
import GenreMultiSelect from "@/shared/components/GenreMultiSelect.vue";
import ModifiedMultiSelect from "@/shared/components/ModifiedMultiSelect.vue";
import { useGetAllArtists } from "@/features";
import { useFetch } from "@/shared";
import type { MultiSelectOptionType, Page, SongResponse } from "@/shared";
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

const { data: artistsData, isLoading: isArtistsLoading } = useGetAllArtists();
const { data: songsData, isLoading: isSongsLoading } = useFetch<Page<SongResponse>>("/api/song/search", { size: 200 });

const artistOptions = computed<MultiSelectOptionType[]>(
  () => artistsData.value?.map((a) => ({ label: a.name, value: a.id })) ?? [],
);

const songOptions = computed<MultiSelectOptionType[]>(
  () => songsData.value?.content?.map((s) => ({ label: s.name, value: s.id })) ?? [],
);

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

  <OverlayPanel ref="op" class="w-80">
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
        <ModifiedMultiSelect
          v-model="artistIds"
          :options="artistOptions"
          :loading="isArtistsLoading"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any artist"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-400">Song</label>
        <ModifiedMultiSelect
          v-model="songIds"
          :options="songOptions"
          :loading="isSongsLoading"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any song"
        />
      </div>
    </div>
  </OverlayPanel>
</template>
