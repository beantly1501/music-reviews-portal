<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, InputNumber, useToast } from "primevue";
import { useForm } from "vee-validate";
import { ModifiedMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  type MultiSelectOptionType,
  albumCreateDefaultValues,
  albumCreateSchema,
  type AlbumResponseDto,
  useGetAllGenres,
} from "@/shared";
import { useCreateAlbum, useUpdateAlbum, useGetAllSongs, useGetAllArtists } from "@/features";
import { computed, watch } from "vue";

const isDialogVisible = defineModel<boolean>();

const props = defineProps<{
  album?: AlbumResponseDto;
}>();

const emit = defineEmits<{
  (e: "refetchAlbums"): void;
}>();

const toast = useToast();
const { createAlbum, isLoading: isCreating } = useCreateAlbum();
const { updateAlbum, isLoading: isUpdating } = useUpdateAlbum();
const { data: genres, isLoading: isGenresLoading } = useGetAllGenres();
const { data: songsData, isLoading: isSongsLoading } = useGetAllSongs();
const { data: artistsData, isLoading: isArtistsLoading } = useGetAllArtists();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const genreOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    genres.value?.map((genre) => ({
      label: genre.name,
      value: genre.id,
    })) || []
  );
});

const artistOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    artistsData.value?.map((artist) => ({
      label: artist.name,
      value: artist.id,
    })) || []
  );
});

const songOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    songsData.value?.map((song) => ({
      label: song.name,
      value: song.id,
    })) || []
  );
});

const validationSchema = toTypedSchema(albumCreateSchema);

const initialValues = computed(() => {
  if (props.album) {
    return {
      name: props.album.name,
      year: props.album.year,
      link: props.album.link,
      genreIds: props.album.genres?.map((g) => g.id) || [],
      songIds: props.album.songs?.map((s) => s.id) || [],
      artistIds: props.album.artists?.map((a) => a.id) || [],
      cover: undefined,
    };
  }
  return albumCreateDefaultValues;
});

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues.value,
  keepValuesOnUnmount: false,
});

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
const [cover] = defineField("cover");
const [genreIds] = defineField("genreIds");
const [songIds] = defineField("songIds");
const [artistIds] = defineField("artistIds");

const onSubmit = handleSubmit(async (values) => {
  let result;
  if (props.album) {
    result = await updateAlbum(props.album.id, values);
  } else {
    result = await createAlbum(values);
  }

  if (result) {
    toast.add({ severity: "success", summary: props.album ? "Album updated successfully" : "Album added successfully" });
    isDialogVisible.value = false;
    emit("refetchAlbums");
  }
});
</script>

<template>
  <Dialog
    modal
    class="w-160"
    v-model:visible="isDialogVisible"
    :header="props.album ? 'Edit album' : 'Add an album'"
    :draggable="false"
  >
    <form @submit="onSubmit" class="flex flex-col gap-3 w-full">
      <div class="flex flex-col gap-2">
        <label>Album Name</label>
        <InputText v-model="name" type="text" :invalid="!!errors.name" />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col w-fit gap-3">
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
        <label for="link">Link to album</label>
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
        <label>Songs (optional)</label>
        <ModifiedMultiSelect
          :options="songOptions"
          :loading="isSongsLoading"
          v-model="songIds"
          :invalid="!!errors.songIds"
        />
        <small v-if="errors.songIds" class="text-red-500">{{
          errors.songIds
        }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Artists (optional)</label>
        <ModifiedMultiSelect
          :options="artistOptions"
          :loading="isArtistsLoading"
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
          :label="props.album ? 'Update album' : 'Add new album'"
          :icon="props.album ? 'pi pi-check' : 'pi pi-plus'"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
