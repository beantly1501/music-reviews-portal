<template>
  <Card
    class="w-[320px] h-[300px] rounded-lg! shadow-md! shadow-black cursor-pointer"
    @click="$emit('playlist-click', playlist)"
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
        <i v-else class="pi pi-list-music text-4xl" />
      </div>
    </template>

    <template #title>
      <div class="flex justify-between items-center">
        <p class="m-0 p-0 text-xl font-bold truncate">{{ playlist.name }}</p>
        <div class="flex gap-3 text-sm text-gray-400 shrink-0">
          <span class="flex items-center gap-1">
            <i class="pi pi-headphones" /> {{ playlist.songs?.length || 0 }}
          </span>
          <span class="flex items-center gap-1">
            <i :class="playlist.isPrivate ? 'pi pi-lock' : 'pi pi-lock-open'" />
          </span>
        </div>
      </div>
    </template>

    <template #subtitle>
      <span class="text-gray-400 text-xs">by {{ playlist.ownerUsername }}</span>
      <span v-if="playlist.description" class="block line-clamp-1 text-sm mt-1">
        {{ playlist.description }}
      </span>
      <span v-else class="block text-gray-500 italic text-sm mt-1">No description.</span>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Image, ProgressSpinner } from "primevue";
import type { PlaylistResponseDto } from "@/shared";
import { useGetFile } from "@/shared";

const props = defineProps<{
  playlist: PlaylistResponseDto;
}>();

defineEmits<{
  (e: "playlist-click", playlist: PlaylistResponseDto): void;
}>();

const { fileUrl: imageUrl, isLoading: isImageLoading } = useGetFile(
  props.playlist.image,
);
</script>
