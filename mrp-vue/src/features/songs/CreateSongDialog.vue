<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, InputNumber } from "primevue";
import { useForm } from "vee-validate";
import { ModifiedMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  type MultiSelectOptionType,
  songCreateDefaultValues,
  songCreateSchema,
  type SongResponse,
  useGetAllGenres,
} from "@/shared";
import { useCreateSong, useUpdateSong } from "@/features";
import { computed } from "vue";

const isDialogVisible = defineModel<boolean>();

const props = defineProps<{
  song?: SongResponse;
}>();

const emit = defineEmits<{
  (e: "refetchSongs"): void;
}>();

const { createSong, isLoading: isCreating } = useCreateSong();
const { updateSong, isLoading: isUpdating } = useUpdateSong();
const { data: genres, isLoading: isGenresLoading } = useGetAllGenres();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const genreOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    genres.value?.map((genre) => ({
      label: genre.name,
      value: genre.id,
    })) || []
  );
});

const validationSchema = toTypedSchema(songCreateSchema);

const initialValues = computed(() => {
  if (props.song) {
    return {
      name: props.song.name,
      year: props.song.year,
      link: props.song.link,
      genreIds: props.song.genres?.map((g) => g.id) || [],
      albumIds: props.song.albums?.map((a) => a.id) || [],
      artistIds: props.song.artists?.map((a) => a.id) || [],
      cover: undefined,
      file: undefined,
    };
  }
  return songCreateDefaultValues;
});

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues.value,
  keepValuesOnUnmount: false,
});

// Watch initialValues and reset form when they change
import { watch } from "vue";
watch(
  initialValues,
  (newValues) => {
    resetForm({ values: newValues });
  },
  { immediate: true },
);

const [name] = defineField("name");
const [link] = defineField("link");
const [year] = defineField("year");
const [file] = defineField("file");
const [cover] = defineField("cover");
const [genreIds] = defineField("genreIds");
const [albumIds] = defineField("albumIds");
const [artistIds] = defineField("artistIds");

const onSubmit = handleSubmit(async (values) => {
  let result;
  if (props.song) {
    result = await updateSong(props.song.id, values);
  } else {
    result = await createSong(values);
  }

  if (result) {
    isDialogVisible.value = false;
    emit("refetchSongs");
  }
});
</script>

<template>
  <Dialog
    modal
    class="w-160"
    v-model:visible="isDialogVisible"
    :header="props.song ? 'Edit song' : 'Add a song'"
    :draggable="false"
  >
    <form @submit="onSubmit" class="flex flex-col gap-3 w-full">
      <div class="flex flex-col gap-2">
        <label>Song Name</label>
        <InputText v-model="name" type="text" :invalid="!!errors.name" />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col w-fit gap-3">
        <div class="flex flex-col gap-2">
          <label for="file">Audio File</label>
          <FileUpload
            label="Choose"
            mode="basic"
            icon="pi pi-plus"
            accept="audio/*"
            :invalid="!!errors.file"
            @select="(e) => (file = e.files[0])"
          />
          <small v-if="errors.file" class="text-red-500">{{
            errors.file
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="cover">Cover Image</label>
          <FileUpload
            label="Choose"
            mode="basic"
            icon="pi pi-plus"
            accept="image/*"
            :invalid="!!errors.cover"
            @select="(e) => (cover = e.files[0])"
          />
          <small v-if="errors.cover" class="text-red-500">{{
            errors.cover
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="link">Link to song</label>
        <InputText
          id="link"
          v-model="link"
          type="text"
          :invalid="!!errors.link"
        />
        <small v-if="errors.link" class="text-red-500">{{ errors.link }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="year">Year</label>
        <InputNumber
          id="year"
          v-model="year"
          :use-grouping="false"
          :invalid="!!errors.year"
        />
        <small v-if="errors.year" class="text-red-500">{{ errors.year }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Genres (optional)</label>
        <ModifiedMultiSelect
          :options="genreOptions"
          :loading="isGenresLoading"
          v-model="genreIds"
          :invalid="!!errors.genreIds"
        />
        <small v-if="errors.genreIds" class="text-red-500">{{
          errors.genreIds
        }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Albums (optional)</label>
        <ModifiedMultiSelect
          :options="[]"
          v-model="albumIds"
          :invalid="!!errors.albumIds"
        />
        <small v-if="errors.albumIds" class="text-red-500">{{
          errors.albumIds
        }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Artists (optional)</label>
        <ModifiedMultiSelect
          :options="[]"
          v-model="artistIds"
          :invalid="!!errors.artistIds"
        />
        <small v-if="errors.artistIds" class="text-red-500">{{
          errors.artistIds
        }}</small>
      </div>

      <div class="flex flex-col gap-2 w-full items-end">
        <Button
          type="submit"
          :label="props.song ? 'Update song' : 'Add new song'"
          :icon="props.song ? 'pi pi-check' : 'pi pi-plus'"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
