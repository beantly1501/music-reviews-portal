<template>
  <Card
    class="w-[320px] h-[560px] rounded-lg! shadow-md! shadow-black cursor-pointer"
    @click="$emit('song-click', song)"
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
      <div class="flex justify-between gap-2 min-w-0">
        <p class="m-0 p-0 truncate min-w-0">{{ song.name }}</p>
        <Tag v-if="song.grade" value="Reviewed" />
      </div>
    </template>

    <template #subtitle>Released {{ song.year }}.</template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="song.genres?.length" class="flex gap-1 items-center overflow-hidden">
          <Chip
            v-for="genre in visibleGenres"
            :key="genre.id"
            :label="genre.name"
            class="w-fit h-2rem shrink-0"
          />
          <span v-if="hasMoreGenres" class="text-gray-400 text-sm shrink-0">...</span>
        </div>

        <div v-else>
          <p class="text-gray-400 h-2rem">No genres available.</p>
        </div>

        <div class="flex flex-col gap-4 justify-center items-center">
          <audio v-if="audioUrl" controls :src="audioUrl" @click.stop />
          <ProgressSpinner v-else-if="isAudioLoading" style="width: 40px; height: 40px" />
          <div v-else>
            <p class="text-gray-400 h-2rem">No audio file available.</p>
          </div>

          <div>
            <Button
              v-if="props.song.link"
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
              label="Review Song"
              class="w-fit"
              v-if="!props.song.grade"
              @click.stop="$emit('review', props.song)"
            />

            <div class="flex items-center my-2.5" v-else>
              <Rating
                :model-value="props.song.grade"
                readonly
                :cancel="false"
              />
            </div>
          </div>
        </div>

        <div
          class="flex justify-content-center gap-2"
          v-if="song.averageRating"
        >
          Average:
          <i class="pi pi-star my-auto" />
          {{ song.averageRating }} / 5
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Card,
  Image,
  Button,
  Tag,
  Chip,
  Rating,
  ProgressSpinner,
} from "primevue";
import type { SongResponse } from "@/shared";
import { useGetFile } from "@/shared";

const props = defineProps<{
  song: SongResponse;
}>();

defineEmits<{
  (e: "review", song: SongResponse): void;
  (e: "song-click", song: SongResponse): void;
}>();

const visibleGenres = computed(() => props.song.genres?.slice(0, 3) ?? []);
const hasMoreGenres = computed(() => (props.song.genres?.length ?? 0) > 3);

const { fileUrl: imageUrl, isLoading: isImageLoading } = useGetFile(
  props.song.imageUrl,
);
const { fileUrl: audioUrl, isLoading: isAudioLoading } = useGetFile(
  props.song.fileUrl,
);

const openLink = () => {
  if (props.song.link) {
    window.open(props.song.link, "_blank");
  }
};
</script>
