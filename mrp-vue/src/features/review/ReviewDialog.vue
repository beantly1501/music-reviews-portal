<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :draggable="false"
    :resizable="false"
    class="w-[95vw] md:w-[85vw] lg:w-[70vw] xl:w-[60vw] max-w-[980px] p-dark"
  >
    <template #header>
      <div class="flex justify-between items-center w-full pr-2">
        <span class="text-xl font-bold">{{ headerTitle }}</span>
        <div class="flex items-center gap-2">
          <Button
            v-if="canEdit"
            label="Edit"
            icon="pi pi-pencil"
            severity="info"
            outlined
            size="small"
            @click="onEdit"
          />
          <Button
            v-if="canDelete"
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            @click="onDelete"
          />
          <Tag
            :value="review?.type === 'SONG' ? 'Song Review' : 'Album Review'"
            :severity="review?.type === 'SONG' ? 'success' : 'info'"
            rounded
          />
        </div>
      </div>
    </template>
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center p-8 gap-4"
    >
      <ProgressSpinner />
      <span class="text-gray-500">Loading...</span>
    </div>

    <div v-else-if="error || !review" class="p-8 text-center text-red-500">
      <i class="pi pi-exclamation-triangle text-4xl mb-4" />
      <p>{{ error?.message || "Review not found." }}</p>
    </div>

    <Card v-else class="shadow-white rounded-[15px]">
      <template #content>
        <div class="flex flex-col gap-4">
          <div class="flex gap-8">
            <div
              class="rounded-lg overflow-hidden w-[180px] h-[180px] shrink-0 bg-[#2a2a2a] flex items-center justify-center"
            >
              <Image
                v-if="displayImageUrl"
                :src="displayImageUrl"
                alt="Review Image"
                image-class="object-cover w-full h-full"
                class="w-full h-full"
              />
              <i
                v-if="!displayImageUrl && isImageLoading"
                class="pi pi-spin pi-spinner text-4xl"
              />
              <i
                v-else-if="!displayImageUrl"
                class="pi pi-image text-4xl text-gray-400"
              />
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <h2 class="text-3xl font-bold m-0">{{ headerTitle }}</h2>
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                  <span
                    class="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                    @click="goToUser"
                  >
                    <i class="pi pi-user" /> {{ review.username }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <i class="pi pi-calendar" /> {{ formattedDate }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <Rating :model-value="review.grade" readonly :cancel="false" />
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Review</h3>
                <p class="text-white! leading-relaxed whitespace-pre-wrap">
                  {{ review.description }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="entity"
            class="bg-[#1a1a1a] p-4 rounded-lg flex flex-col gap-4"
          >
            <div>
              <h4 class="font-bold text-lg">{{ entity.name }}</h4>
              <p v-if="'year' in entity" class="text-sm text-gray-400">
                Released {{ entity.year }}
              </p>
            </div>

            <div
              v-if="review.type === 'SONG' && (entity as any).genres"
              class="flex flex-wrap gap-1"
            >
              <Chip
                v-for="genre in (entity as any).genres"
                :key="genre.id"
                :label="genre.name"
                class="text-xs"
              />
            </div>
            <div v-else>
              <p class="text-gray-400 h-2rem">No genres available.</p>
            </div>

            <Button
              v-if="'link' in entity && entity.link"
              :label="
                review.type === 'SONG' ? 'Open Song Link' : 'Open Album Link'
              "
              icon="pi pi-external-link"
              outlined
              @click="openExternalLink(entity.link)"
            />

            <div v-if="review.type === 'SONG'" class="mt-4">
              <div v-if="isSongLoading" class="flex justify-center p-4">
                <i class="pi pi-spin pi-spinner" />
              </div>
              <div v-else-if="songAudioUrl" class="w-full">
                <audio controls :src="songAudioUrl" class="w-full" />
              </div>
              <div
                v-else
                class="text-center p-4 bg-[#1a1a1a] rounded text-gray-400 text-sm"
              >
                No audio file available.
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </Dialog>
  <EditReviewDialog
    v-if="isEditDialogVisible && review"
    v-model:visible="isEditDialogVisible"
    :review-id="reviewId!"
    :review-type="reviewType!"
    :name="headerTitle"
    :initial-values="{
      grade: review.grade,
      description: review.description,
      songId: review.songId,
      albumId: review.albumId,
    }"
    @success="onEditSuccess"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Dialog,
  Button,
  Tag,
  Card,
  Rating,
  Chip,
  ProgressSpinner,
  Image,
} from "primevue";
import { useAuthStore, useGetFile } from "@/shared";
import { useGetReview } from "@/features";
import { useGetSong } from "../songs/hooks/useGetSong";
import { useDeleteReview } from "@/features";
import EditReviewDialog from "./EditReviewDialog.vue";
import { Role } from "@/features";
import { storeToRefs } from "pinia";
import router from "@/router/routes";

const props = defineProps<{
  visible: boolean;
  reviewId: number | undefined;
  reviewType: "SONG" | "ALBUM" | undefined;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "edit", reviewId: number): void;
  (e: "delete", reviewId: number): void;
  (e: "refetch"): void;
}>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { deleteReview } = useDeleteReview();

const isEditDialogVisible = ref(false);
const isDeleting = ref(false);

// Fetch Review
const {
  data: review,
  isLoading,
  error,
  refetch: refetchReview,
} = useGetReview(props.reviewId, props.reviewType);

// Fetch Entity (Song or Album)
const songId = computed(() =>
  review.value?.type === "SONG" ? review.value.songId : undefined,
);
// const albumId = computed(() => (review.value?.type === 'ALBUM' ? review.value.albumId : undefined));

const { data: song, isLoading: isSongLoading } = useGetSong(songId);
// const { data: album } = useGetAlbum(albumId.value); // Add this when album feature is ready

const entity = computed(() => {
  if (review.value?.type === "SONG") return song.value;
  // if (review.value?.type === 'ALBUM') return album.value;
  return null;
});

// Files
const imageUrl = computed(() => {
  if (review.value?.type === "SONG" && song.value?.imageUrl) {
    return song.value.imageUrl;
  }
  return review.value?.image;
});

// const audioUrl = computed(() => {
//   if (review.value?.type === "SONG" && review.value.songId) {
//     return `/api/song/audio-file/${review.value.songId}`;
//   }
//   return review.value?.image;
// });

const { fileUrl: displayImageUrl, isLoading: isImageLoading } =
  useGetFile(imageUrl);

const audioUrl = computed(() => song.value?.fileUrl);

const { fileUrl: songAudioUrl } = useGetFile(audioUrl);

const headerTitle = computed(() => {
  if (!review.value) return "Review";
  return review.value.type === "SONG"
    ? (review.value.songName ?? "Song Review")
    : (review.value.albumName ?? "Album Review");
});

const formattedDate = computed(() => {
  if (!review.value) return "";
  return new Date(review.value.creationDate).toLocaleDateString("hr-HR");
});

const canEdit = computed(() => {
  return (
    !!user.value &&
    !!review.value &&
    user.value.username === review.value.username
  );
});

const canDelete = computed(() => {
  return (
    !!user.value &&
    !!review.value &&
    (user.value.username === review.value.username ||
      user.value.role === Role.ADMIN)
  );
});

const onEdit = () => {
  isEditDialogVisible.value = true;
};

const onEditSuccess = () => {
  refetchReview();
  emit("refetch");
};

const onDelete = async () => {
  if (!props.reviewId || !props.reviewType) return;

  if (confirm("Are you sure you want to delete this review?")) {
    try {
      isDeleting.value = true;
      await deleteReview(props.reviewId, props.reviewType);
      emit("refetch");
      emit("update:visible", false);
    } catch (e) {
      console.error("Failed to delete review:", e);
    } finally {
      isDeleting.value = false;
    }
  }
};

const openExternalLink = (link: string) => {
  window.open(link, "_blank");
};

const goToUser = () => {
  if (!review.value) return;
  if (user.value?.username === review.value.username) {
    router.push("/profile");
  } else {
    router.push(`/user/${review.value.userId}`);
  }
  emit("update:visible", false);
};
</script>
