<template>
  <Card
    class="w-[320px] h-[560px] rounded-lg! shadow-md! shadow-black"
    @click="$emit('album-click', album)"
  >
    <template #header>
      <div
        class="w-full h-[180px] rounded-t-lg! object-cover bg-[#5f5f5f] flex justify-center items-center overflow-hidden"
      >
        <Image
          v-if="imageUrl"
          :src="imageUrl"
          image-class="object-cover w-full h-full"
          class="w-full h-full"
        />
        <ProgressSpinner v-else-if="isImageLoading" />
        <i v-else class="pi pi-image text-4xl" />
      </div>
    </template>

    <template #title>
      <div class="flex justify-between">
        <p class="m-0 p-0 text-xl font-bold truncate">{{ album.name }}</p>

        <div class="flex gap-2 items-center">
          <i class="pi pi-headphones" />
          <span class="text-sm">{{ album.songs?.length || 0 }}</span>
        </div>
      </div>
    </template>

    <template #subtitle>
      <div class="flex flex-col min-w-0">
        <span>Released {{ album.year }}.</span>
        <span v-if="album.artists?.length" class="text-sm truncate">
          by {{ album.artists.map((a) => a.name).join(", ") }}
        </span>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="album.genres?.length" class="flex flex-wrap gap-1">
          <Chip
            v-for="genre in album.genres"
            :key="genre.id"
            :label="genre.name"
            class="w-fit h-2rem"
          />
        </div>

        <div v-else>
          <p class="text-gray-400 h-2rem">No genres available.</p>
        </div>

        <div class="flex flex-col gap-4 justify-center items-center">
          <div class="text-sm text-gray-300">
            {{ album.songs?.length || 0 }} songs
          </div>

          <div>
            <Button
              v-if="album.link"
              label="Open Spotify / Youtube link"
              class="w-full"
              icon="pi pi-external-link"
              @click.stop="openLink"
            />

            <div v-else>
              <p class="text-gray-400 h-2rem">No external link available.</p>
            </div>
          </div>

          <div>
            <Button
              icon="pi pi-star"
              label="Review Album"
              class="w-fit"
              v-if="!album.grade"
              @click.stop="$emit('review', album)"
            />

            <div class="flex items-center my-2.5" v-else>
              <Rating :model-value="album.grade" readonly :cancel="false" />
            </div>
          </div>
        </div>

        <div
          class="flex justify-content-center gap-2"
          v-if="album.averageRating"
        >
          Average:
          <i class="pi pi-star my-auto" />
          {{ album.averageRating }} / 5
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Image, Button, Chip, Rating, ProgressSpinner } from "primevue";
import type { AlbumResponseDto } from "@/shared";
import { useGetFile } from "@/shared";

const props = defineProps<{
  album: AlbumResponseDto;
}>();

defineEmits<{
  (e: "review", album: AlbumResponseDto): void;
  (e: "album-click", album: AlbumResponseDto): void;
}>();

const { fileUrl: imageUrl, isLoading: isImageLoading } = useGetFile(
  props.album.imageUrl,
);

const openLink = () => {
  if (props.album.link) {
    window.open(props.album.link, "_blank");
  }
};
</script>
