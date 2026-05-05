<template>
  <Card
    class="w-[300px] rounded-lg! shadow-md! shadow-black overflow-hidden cursor-pointer"
    @click="onCardClick"
  >
    <template #header>
      <div
        class="w-full h-[180px] rounded-t-lg! object-cover bg-[#5f5f5f] flex justify-center items-center overflow-hidden"
      >
        <Image
          v-if="imageUrl"
          :src="imageUrl"
          alt="Review Image"
          image-class="object-cover w-full h-full"
          class="w-full h-full"
        />
        <ProgressSpinner v-if="!imageUrl && isLoading" />
        <i v-else-if="!imageUrl" class="pi pi-image text-4xl" />
      </div>
    </template>

    <template #title>
      <p class="m-0 p-0 text-xl font-bold truncate">{{ title }}</p>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap justify-between items-center mb-2">
          <Rating
            :model-value="review.grade"
            readonly
            :cancel="false"
            :stars="5"
          />
          <Tag
            :value="review.type === 'SONG' ? 'Song' : 'Album'"
            :severity="review.type === 'SONG' ? 'success' : 'info'"
            class="font-semibold px-3 py-1"
          />
        </div>
        <p
          class="text-sm leading-relaxed m-0 h-[3rem] overflow-hidden text-ellipsis"
        >
          {{ review.description }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center mt-4 pt-4">
        <span class="text-xs text-gray-400">
          {{ new Date(review.creationDate).toLocaleDateString("hr-HR") }}
        </span>
        <span @click.stop="router.push(`/user/${review.userId}`)">
          <Tag
            :value="review.username"
            severity="warn"
            class="font-semibold px-3 py-1 cursor-pointer"
          />
        </span>
      </div>
    </template>
  </Card>

  <ReviewDialog
    v-if="isDialogVisible"
    v-model:visible="isDialogVisible"
    :review-id="review.id"
    :review-type="review.type"
    @refetch="onRefetch"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Card, Tag, Rating, Image, ProgressSpinner } from "primevue";
import type { ReviewResponse } from "@/shared";
import { useGetFile } from "@/shared";
import { ReviewDialog } from "@/features";

const router = useRouter();

const props = defineProps<{
  review: ReviewResponse;
}>();

const emit = defineEmits<{
  (e: "click", review: ReviewResponse): void;
  (e: "refetch"): void;
}>();

const isDialogVisible = ref(false);

const title = computed(() => {
  return props.review.type === "SONG"
    ? (props.review.songName ?? "Song")
    : (props.review.albumName ?? "Album");
});

const { fileUrl: imageUrl, isLoading } = useGetFile(props.review.image);

const onCardClick = () => {
  isDialogVisible.value = true;
  emit("click", props.review);
};

const onRefetch = () => {
  emit("refetch");
};
</script>
