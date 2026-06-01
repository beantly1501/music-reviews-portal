<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, Textarea, useToast } from "primevue";
import { useForm } from "vee-validate";
import { LazyMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  artistCreateDefaultValues,
  artistCreateSchema,
  type ArtistResponseDto,
} from "@/shared";
import { useCreateArtist, useUpdateArtist, useGetSongsLazy, useGetAlbumsLazy } from "@/features";
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
const songs = useGetSongsLazy();
const albums = useGetAlbumsLazy();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const songOptions = computed(() => songs.items.value.map((s) => ({ label: s.name, value: s.id })));
const albumOptions = computed(() => albums.items.value.map((a) => ({ label: a.name, value: a.id })));

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

const onShow = () => {
  songs.initialize();
  albums.initialize();
};

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
    @show="onShow"
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
        <LazyMultiSelect
          v-model="songIds"
          :options="songOptions"
          :has-more="songs.hasMore.value"
          :loading="songs.isLoading.value"
          :invalid="!!errors.songIds"
          placeholder="Select songs"
          @filter="songs.onFilter"
          @load-more="songs.loadMore"
        />
        <small v-if="errors.songIds" class="text-red-500">{{ errors.songIds }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Albums (optional)</label>
        <LazyMultiSelect
          v-model="albumIds"
          :options="albumOptions"
          :has-more="albums.hasMore.value"
          :loading="albums.isLoading.value"
          :invalid="!!errors.albumIds"
          placeholder="Select albums"
          @filter="albums.onFilter"
          @load-more="albums.loadMore"
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
