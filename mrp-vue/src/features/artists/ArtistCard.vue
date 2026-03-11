<template>
  <Card
    class="w-[320px] h-[300px] rounded-lg! shadow-md! shadow-black cursor-pointer"
    @click="$emit('artist-click', artist)"
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
        <i v-else class="pi pi-user text-4xl" />
      </div>
    </template>

    <template #title>
      <div class="flex justify-between items-center">
        <p class="m-0 p-0 text-xl font-bold truncate">{{ artist.name }}</p>
        <div class="flex gap-3 text-sm text-gray-400 shrink-0">
          <span class="flex items-center gap-1">
            <i class="pi pi-headphones" /> {{ artist.songs?.length || 0 }}
          </span>
          <span class="flex items-center gap-1">
            <i class="pi pi-book" /> {{ artist.albums?.length || 0 }}
          </span>
        </div>
      </div>
    </template>

    <template #subtitle>
      <span v-if="artist.description" class="line-clamp-2 text-sm">
        {{ artist.description }}
      </span>
      <span v-else class="text-gray-500 italic text-sm">No description.</span>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Image, ProgressSpinner } from "primevue";
import type { ArtistResponseDto } from "@/shared";
import { useGetFile } from "@/shared";

const props = defineProps<{
  artist: ArtistResponseDto;
}>();

defineEmits<{
  (e: "artist-click", artist: ArtistResponseDto): void;
}>();

const { fileUrl: imageUrl, isLoading: isImageLoading } = useGetFile(
  props.artist.imageUrl,
);
</script>
