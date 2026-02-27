<template>
  <Card class="w-[320px] h-[560px] rounded-lg! shadow-md! shadow-black">
    <template #header>
      <div
        class="w-full h-[180px] rounded-t-lg! object-cover bg-[#5f5f5f] flex justify-center items-center overflow-hidden"
      >
        <Image v-if="imageUrl" :src="imageUrl" />
        <i v-else-if="isImageLoading" class="pi pi-spin pi-spinner text-4xl" />
        <i v-else class="pi pi-image text-4xl" />
      </div>
    </template>

    <template #title>
      <div class="flex justify-between">
        <p class="m-0 p-0">{{ song.name }}</p>
        <Tag v-if="song.grade" value="Reviewed" />
      </div>
    </template>

    <template #subtitle>Released {{ song.year }}.</template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="song.genres" class="flex flex-wrap gap-1">
          <Chip
            v-for="genre in song.genres"
            :key="genre.id"
            :label="genre.name"
            class="w-fit h-2rem"
          />
        </div>

        <div v-else>
          <p class="text-gray-400 h-2rem">No genres available</p>
        </div>

        <div class="flex flex-col gap-4 justify-center items-center">
          <audio v-if="audioUrl" controls :src="audioUrl" />
          <i v-else class="pi pi-spin pi-spinner" />

          <Button
            label="Open Spotify / Youtube link"
            class="w-full"
            icon="pi pi-external-link"
            @click="openLink"
          />

          <Button icon="pi pi-star" label="Review Song" class="w-fit" />
        </div>

        <div class="flex justify-content-center gap-2">
          Average:
          <i class="pi pi-star my-auto" />
          {{ song.averageRating }} / 5
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Image, Button, Tag, Chip } from "primevue";
import type { SongResponse } from "@/shared";
import { useGetFile } from "@/shared";

const props = defineProps<{
  song: SongResponse;
}>();

const { fileUrl: imageUrl, isLoading: isImageLoading } = useGetFile(
  props.song.imageUrl,
);
const { fileUrl: audioUrl } = useGetFile(props.song.fileUrl);

const openLink = () => {
  if (props.song.link) {
    window.open(props.song.link, "_blank");
  }
};
</script>
