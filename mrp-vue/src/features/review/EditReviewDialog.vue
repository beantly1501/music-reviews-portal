<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="headerTitle"
    modal
    class="w-[400px] p-dark"
    :draggable="false"
  >
    <form @submit="onSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="grade">Grade</label>
        <div class="flex justify-center">
          <Rating
            v-model="grade"
            :cancel="false"
            :stars="5"
            :invalid="!!errors.grade"
          />
        </div>
        <small v-if="errors.grade" class="text-red-500 text-center"
          >Rating is required.</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="description">Description</label>
        <Textarea
          id="description"
          v-model="description"
          rows="5"
          auto-resize
          :invalid="!!errors.description"
        />
        <small v-if="errors.description" class="text-red-500">{{
          errors.description
        }}</small>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          text
          @click="$emit('update:visible', false)"
        />
        <Button
          type="submit"
          label="Submit"
          icon="pi pi-check"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Dialog, Button, Rating, Textarea, useToast } from "primevue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { songReviewSchema, albumReviewSchema } from "@/shared";
import type { SongReviewForm, AlbumReviewForm } from "@/shared";
import { useUpdateReview, useCreateReview } from "@/features";

const props = defineProps<{
  visible: boolean;
  reviewId?: number;
  reviewType: "SONG" | "ALBUM";
  name: string;
  initialValues: {
    grade: number;
    description: string;
    songId?: number;
    albumId?: number;
  };
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const toast = useToast();
const { updateSongReview, updateAlbumReview } = useUpdateReview();
const { createSongReview, createAlbumReview } = useCreateReview();

const validationSchema = computed(() => {
  return props.reviewType === "SONG"
    ? toTypedSchema(songReviewSchema)
    : toTypedSchema(albumReviewSchema);
});

const { handleSubmit, defineField, errors, isSubmitting, resetForm } = useForm({
  validationSchema,
  initialValues: props.initialValues,
});

const [grade] = defineField("grade");
const [description] = defineField("description");

const headerTitle = computed(() =>
  props.reviewId ? `Update ${props.name}` : `Review ${props.name}`,
);

const onSubmit = handleSubmit(async (values) => {
  try {
    if (props.reviewType === "SONG") {
      if (props.reviewId) {
        await updateSongReview(
          props.reviewId,
          values as unknown as SongReviewForm,
        );
      } else {
        await createSongReview(values as unknown as SongReviewForm);
      }
    } else {
      if (props.reviewId) {
        await updateAlbumReview(
          props.reviewId,
          values as unknown as AlbumReviewForm,
        );
      } else {
        await createAlbumReview(values as unknown as AlbumReviewForm);
      }
    }
    toast.add({
      severity: "success",
      summary: "Reviewed successfully",
      life: 3000,
    });
    emit("success");
    emit("update:visible", false);
    resetForm();
  } catch (error) {
    console.error("Failed to submit review:", error);
  }
});
</script>
