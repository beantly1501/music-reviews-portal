<script setup lang="ts">
import { Button, Dialog, InputText, FileUpload, Textarea, ToggleSwitch, useToast } from "primevue";
import { useForm } from "vee-validate";
import { LazyMultiSelect } from "@/shared/components";
import { toTypedSchema } from "@vee-validate/zod";
import {
  playlistCreateDefaultValues,
  playlistCreateSchema,
  type PlaylistResponseDto,
} from "@/shared";
import { useGetSongsLazy } from "@/features";
import { useCreatePlaylist } from "./hooks/useCreatePlaylist";
import { useUpdatePlaylist } from "./hooks/useUpdatePlaylist";
import { computed, watch } from "vue";
import { useGetAllUsers } from "./hooks/useGetAllUsers";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";

const isDialogVisible = defineModel<boolean>();

const props = defineProps<{
  playlist?: PlaylistResponseDto;
  isCollaboratorOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: "refetchPlaylists"): void;
}>();

const toast = useToast();
const { user } = storeToRefs(useAuthStore());
const { createPlaylist, isLoading: isCreating } = useCreatePlaylist();
const { updatePlaylist, isLoading: isUpdating } = useUpdatePlaylist();
const songs = useGetSongsLazy();
const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers();

const isSubmitting = computed(() => isCreating.value || isUpdating.value);

const songOptions = computed(() => songs.items.value.map((s) => ({ label: s.name, value: s.id })));

const collaboratorOptions = computed(() => {
  return (
    usersData.value
      ?.filter((u) => u.username !== user.value?.username)
      .map((u) => ({
        label: u.username,
        value: u.id,
      })) || []
  );
});

const validationSchema = toTypedSchema(playlistCreateSchema);

const initialValues = computed(() => {
  if (props.playlist) {
    return {
      name: props.playlist.name,
      description: props.playlist.description ?? undefined,
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

const onShow = () => {
  songs.initialize();
};

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
    toast.add({ severity: "success", summary: props.playlist ? "Playlist updated successfully" : "Playlist added successfully" });
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
    @show="onShow"
  >
    <form @submit="onSubmit" class="flex flex-col gap-3 w-full">
      <div class="flex flex-col gap-2">
        <label>Playlist Name</label>
        <InputText v-model="name" type="text" :invalid="!!errors.name" :disabled="props.isCollaboratorOnly" />
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
            :disabled="props.isCollaboratorOnly"
            @select="(e) => (image = e.files[0])"
          />
          <small v-if="errors.image" class="text-red-500">{{ errors.image }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label>Description (optional)</label>
        <Textarea v-model="description" rows="3" :invalid="!!errors.description" :disabled="props.isCollaboratorOnly" class="resize-none" />
        <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
      </div>

      <div class="flex items-center gap-3">
        <label>Private</label>
        <ToggleSwitch v-model="isPrivate" :disabled="props.isCollaboratorOnly" />
      </div>

      <div class="flex flex-col gap-2">
        <label>Songs (optional)</label>
        <LazyMultiSelect
          v-model="songIds"
          :options="songOptions"
          :has-more="songs.hasMore.value"
          :loading="songs.isLoading.value"
          :invalid="!!errors.songIds"
          :disabled="props.isCollaboratorOnly"
          placeholder="Select songs"
          @filter="songs.onFilter"
          @load-more="songs.loadMore"
        />
        <small v-if="errors.songIds" class="text-red-500">{{ errors.songIds }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label>Collaborators (optional)</label>
        <LazyMultiSelect
          v-model="collaboratorIds"
          :options="collaboratorOptions"
          :has-more="false"
          :loading="isUsersLoading"
          :invalid="!!errors.collaboratorIds"
          :disabled="props.isCollaboratorOnly"
          placeholder="Select collaborators"
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
