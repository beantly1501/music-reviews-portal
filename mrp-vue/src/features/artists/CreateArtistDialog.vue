<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, Textarea, useToast } from "primevue";
import { useForm } from "vee-validate";
import { ModifiedMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  type MultiSelectOptionType,
  artistCreateDefaultValues,
  artistCreateSchema,
  type ArtistResponseDto,
} from "@/shared";
import { useCreateArtist, useUpdateArtist, useGetAllSongs, useGetAllAlbums } from "@/features";
import { computed, watch } from "vue";

const isDialogVisible = defineModel<boolean>();

const props = defineProps<{
  artist?: ArtistResponseDto;
}>();

const emit = defineEmits<{
  (e: "refetchArtists"): void;
}>();

const toast = useToast();
const { createArtist, isLoading: isCreating } = useCreateArtist();
const { updateArtist, isLoading: isUpdating } = useUpdateArtist();
const { data: songsData, isLoading: isSongsLoading } = useGetAllSongs();
const { data: albumsData, isLoading: isAlbumsLoading } = useGetAllAlbums();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const songOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    songsData.value?.map((song) => ({
      label: song.name,
      value: song.id,
    })) || []
  );
});

const albumOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    albumsData.value?.content.map((album) => ({
      label: album.name,
      value: album.id,
    })) || []
  );
});

const validationSchema = toTypedSchema(artistCreateSchema);

const initialValues = computed(() => {
  if (props.artist) {
    return {
      name: props.artist.name,
      description: props.artist.description,
      songIds: props.artist.songs?.map((s) => s.id) || [],
      albumIds: props.artist.albums?.map((a) => a.id) || [],
      image: undefined,
    };
  }
  return artistCreateDefaultValues;
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
const [description] = defineField("description");
const [image] = defineField("image");
const [songIds] = defineField("songIds");
const [albumIds] = defineField("albumIds");

const onSubmit = handleSubmit(async (values) => {
  let result;
  if (props.artist) {
    result = await updateArtist(props.artist.id, values);
  } else {
    result = await createArtist(values);
  }

  if (result) {
    toast.add({ severity: "success", summary: props.artist ? "Artist updated successfully" : "Artist added successfully" });
    isDialogVisible.value = false;
    emit("refetchArtists");
  }
});
</script>

<template>
  <Dialog
    modal
    class="w-160"
    v-model:visible="isDialogVisible"
    :header="props.artist ? 'Edit artist' : 'Add an artist'"
    :draggable="false"
  >
    <form @submit="onSubmit" class="flex flex-col gap-3 w-full">
      <div class="flex flex-col gap-2">
        <label>Artist Name</label>
        <InputText v-model="name" type="text" :invalid="!!errors.name" />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col w-fit gap-3">
        <div class="flex flex-col gap-2">
          <label for="image">Artist Image</label>
          <FileUpload
            label="Choose"
            mode="basic"
            icon="pi pi-plus"
            accept="image/*"
            :invalid="!!errors.image"
            @select="(e) => (image = e.files[0])"
          />
          <small v-if="errors.image" class="text-red-500">{{ errors.image }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label>Description (optional)</label>
        <Textarea v-model="description" rows="3" :invalid="!!errors.description" />
        <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Songs (optional)</label>
        <ModifiedMultiSelect
          :options="songOptions"
          :loading="isSongsLoading"
          v-model="songIds"
          :invalid="!!errors.songIds"
        />
        <small v-if="errors.songIds" class="text-red-500">{{ errors.songIds }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Albums (optional)</label>
        <ModifiedMultiSelect
          :options="albumOptions"
          :loading="isAlbumsLoading"
          v-model="albumIds"
          :invalid="!!errors.albumIds"
        />
        <small v-if="errors.albumIds" class="text-red-500">{{ errors.albumIds }}</small>
      </div>

      <div class="flex flex-col gap-2 w-full items-end">
        <Button
          type="submit"
          :label="props.artist ? 'Update artist' : 'Add new artist'"
          :icon="props.artist ? 'pi pi-check' : 'pi pi-plus'"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
