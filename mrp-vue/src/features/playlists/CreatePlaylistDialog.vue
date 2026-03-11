<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, Textarea, ToggleSwitch } from "primevue";
import { useForm } from "vee-validate";
import { ModifiedMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  type MultiSelectOptionType,
  playlistCreateDefaultValues,
  playlistCreateSchema,
  type PlaylistResponseDto,
} from "@/shared";
import { useGetAllSongs } from "@/features/songs";
import { useCreatePlaylist } from "./hooks/useCreatePlaylist";
import { useUpdatePlaylist } from "./hooks/useUpdatePlaylist";
import { useGetOtherUsers } from "./hooks/useGetOtherUsers";
import { computed, watch } from "vue";

const isDialogVisible = defineModel<boolean>();

const props = defineProps<{
  playlist?: PlaylistResponseDto;
}>();

const emit = defineEmits<{
  (e: "refetchPlaylists"): void;
}>();

const { createPlaylist, isLoading: isCreating } = useCreatePlaylist();
const { updatePlaylist, isLoading: isUpdating } = useUpdatePlaylist();
const { data: songsData, isLoading: isSongsLoading } = useGetAllSongs();
const { data: usersData, isLoading: isUsersLoading } = useGetOtherUsers();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const songOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    songsData.value?.map((song) => ({
      label: song.name,
      value: song.id,
    })) || []
  );
});

const collaboratorOptions = computed<MultiSelectOptionType[]>(() => {
  return (
    usersData.value?.map((user) => ({
      label: user.username,
      value: user.id,
    })) || []
  );
});

const validationSchema = toTypedSchema(playlistCreateSchema);

const initialValues = computed(() => {
  if (props.playlist) {
    return {
      name: props.playlist.name,
      description: props.playlist.description,
      isPrivate: props.playlist.isPrivate,
      songIds: props.playlist.songs?.map((s) => s.id) || [],
      collaboratorIds: props.playlist.collaborators?.map((c) => c.id) || [],
      image: undefined,
    };
  }
  return playlistCreateDefaultValues;
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
const [isPrivate] = defineField("isPrivate");
const [songIds] = defineField("songIds");
const [collaboratorIds] = defineField("collaboratorIds");

const onSubmit = handleSubmit(async (values) => {
  let result;
  if (props.playlist) {
    result = await updatePlaylist(props.playlist.id, values);
  } else {
    result = await createPlaylist(values);
  }

  if (result) {
    isDialogVisible.value = false;
    emit("refetchPlaylists");
  }
});
</script>

<template>
  <Dialog
    modal
    class="w-160"
    v-model:visible="isDialogVisible"
    :header="props.playlist ? 'Edit playlist' : 'Add a playlist'"
    :draggable="false"
  >
    <form @submit="onSubmit" class="flex flex-col gap-3 w-full">
      <div class="flex flex-col gap-2">
        <label>Playlist Name</label>
        <InputText v-model="name" type="text" :invalid="!!errors.name" />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col w-fit gap-3">
        <div class="flex flex-col gap-2">
          <label for="image">Playlist Image</label>
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

      <div class="flex items-center gap-3">
        <label>Private</label>
        <ToggleSwitch v-model="isPrivate" />
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
        <label>Collaborators (optional)</label>
        <ModifiedMultiSelect
          :options="collaboratorOptions"
          :loading="isUsersLoading"
          v-model="collaboratorIds"
          :invalid="!!errors.collaboratorIds"
        />
        <small v-if="errors.collaboratorIds" class="text-red-500">{{ errors.collaboratorIds }}</small>
      </div>

      <div class="flex flex-col gap-2 w-full items-end">
        <Button
          type="submit"
          :label="props.playlist ? 'Update playlist' : 'Add new playlist'"
          :icon="props.playlist ? 'pi pi-check' : 'pi pi-plus'"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
