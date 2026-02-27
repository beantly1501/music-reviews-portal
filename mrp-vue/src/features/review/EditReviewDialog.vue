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
        <small v-if="errors.grade" class="text-red-500 text-center">{{
          errors.grade
        }}</small>
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
import { Dialog, Button, Rating, Textarea } from "primevue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { songReviewSchema, albumReviewSchema } from "@/shared";
import type { SongReviewForm, AlbumReviewForm } from "@/shared";
import { useUpdateReview } from "./hooks/useUpdateReview";

const props = defineProps<{
  visible: boolean;
  reviewId: number;
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

const { updateSongReview, updateAlbumReview } = useUpdateReview();

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

const headerTitle = computed(() => `Update ${props.name}`);

const onSubmit = handleSubmit(async (values) => {
  try {
    if (props.reviewType === "SONG") {
      await updateSongReview(
        props.reviewId,
        values as unknown as SongReviewForm,
      );
    } else {
      await updateAlbumReview(
        props.reviewId,
        values as unknown as AlbumReviewForm,
      );
    }
    emit("success");
    emit("update:visible", false);
    resetForm();
  } catch (error) {
    console.error("Failed to update review:", error);
  }
});
</script>
