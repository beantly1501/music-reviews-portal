<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, OverlayPanel } from "primevue";
import GenreMultiSelect from "@/shared/components/GenreMultiSelect.vue";
import ModifiedMultiSelect from "@/shared/components/ModifiedMultiSelect.vue";
import { useGetAllArtists } from "@/features";
import { useFetch } from "@/shared";
import type { MultiSelectOptionType, Page, AlbumResponseDto } from "@/shared";
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

const { data: artistsData, isLoading: isArtistsLoading } = useGetAllArtists();
const { data: albumsData, isLoading: isAlbumsLoading } = useFetch<Page<AlbumResponseDto>>("/api/album/search", { size: 200 });

const artistOptions = computed<MultiSelectOptionType[]>(
  () => artistsData.value?.map((a) => ({ label: a.name, value: a.id })) ?? [],
);

const albumOptions = computed<MultiSelectOptionType[]>(
  () => albumsData.value?.content?.map((a) => ({ label: a.name, value: a.id })) ?? [],
);

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

  <OverlayPanel ref="op" class="w-80">
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
        <label class="text-xs text-gray-400">Album</label>
        <ModifiedMultiSelect
          v-model="albumIds"
          :options="albumOptions"
          :loading="isAlbumsLoading"
          scroll-height="150px"
          :panel-style="{ width: '400px' }"
          placeholder="Any album"
        />
      </div>
    </div>
  </OverlayPanel>
</template>
