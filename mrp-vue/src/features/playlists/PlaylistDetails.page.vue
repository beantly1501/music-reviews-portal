<template>
  <div v-if="isLoading" class="flex justify-center p-8">
    <ProgressSpinner />
  </div>
  <div v-else-if="playlist" class="flex flex-col gap-4 p-4">
    <ConfirmDialog />
    <div class="flex justify-between">
      <CreatePlaylistDialog
        v-if="playlist"
        v-model="isEditDialogVisible"
        :playlist="playlist"
        @refetchPlaylists="onEditSuccess"
      />
      <Button
        label="Home"
        icon="pi pi-home"
        class="p-button-outlined"
        @click="goHome"
      />

      <div class="flex gap-3">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          class="p-button-outlined"
          severity="info"
          @click="isEditDialogVisible = true"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-outlined"
          severity="danger"
          @click="onDeletePlaylist"
        />
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          class="p-button-outlined"
          severity="secondary"
          @click="goBack"
        />
      </div>
    </div>

    <Card class="w-full">
      <template #content>
        <div class="flex gap-8">
          <div
            class="rounded-lg overflow-hidden w-[180px] h-[180px] shrink-0 bg-[#2a2a2a] flex items-center justify-center"
          >
            <Image
              v-if="displayImageUrl"
              :src="displayImageUrl"
              alt="Playlist Image"
              image-class="object-cover w-full h-full"
              class="w-full h-full"
            />
            <ProgressSpinner v-if="!displayImageUrl && isImageLoading" />
            <i
              v-else-if="!displayImageUrl"
              class="pi pi-list-music text-4xl text-gray-400"
            />
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <h2 class="text-3xl font-bold m-0">{{ playlist.name }}</h2>
              <div class="flex items-center gap-2 text-gray-400 text-sm">
                <span class="flex items-center gap-1">
                  <i class="pi pi-user" /> {{ playlist.ownerUsername }}
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-headphones" /> {{ playlist.songs?.length || 0 }} songs
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <i :class="playlist.isPrivate ? 'pi pi-lock' : 'pi pi-lock-open'" />
                  {{ playlist.isPrivate ? "Private" : "Public" }}
                </span>
              </div>
              <div class="text-gray-500 text-xs">
                Created {{ playlist.creationDate }}
                <span v-if="playlist.lastEditedBy">
                  · Last edited by {{ playlist.lastEditedBy.username }}
                </span>
              </div>
            </div>

            <div v-if="playlist.description">
              <p class="text-gray-300">{{ playlist.description }}</p>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="playlist.songs?.length" class="w-full">
      <template #title>Songs</template>
      <template #content>
        <DataTable
          :value="playlist.songs"
          row-hover
          class="cursor-pointer"
          @row-click="(e) => router.push(`/song/${e.data.id}`)"
        >
          <Column field="name" header="Name" sortable />
          <Column field="year" header="Year" sortable />
        </DataTable>
      </template>
    </Card>

    <Card v-if="playlist.collaborators?.length" class="w-full">
      <template #title>Collaborators</template>
      <template #content>
        <DataTable :value="playlist.collaborators">
          <Column field="username" header="Username" />
        </DataTable>
      </template>
    </Card>
  </div>
  <div v-else class="flex justify-center p-8">
    <p>Playlist not found.</p>
  </div>
</template>

<script setup lang="ts">
import {
  ProgressSpinner,
  Button,
  Card,
  Image,
  DataTable,
  Column,
  ConfirmDialog,
} from "primevue";
import { useConfirm } from "primevue/useconfirm";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useGetFile } from "@/shared";
import { useGetPlaylist } from "./hooks/useGetPlaylist";
import { useDeletePlaylist } from "./hooks/useDeletePlaylist";
import CreatePlaylistDialog from "./CreatePlaylistDialog.vue";

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const playlistId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : undefined;
});

const {
  data: playlist,
  isLoading: isPlaylistLoading,
  refetch: refetchPlaylist,
} = useGetPlaylist(playlistId);

const { deletePlaylist } = useDeletePlaylist();

const isEditDialogVisible = ref(false);
const isLoading = computed(() => isPlaylistLoading.value);

const { fileUrl: displayImageUrl, isLoading: isImageLoading } = useGetFile(
  computed(() => playlist.value?.image),
);

const goHome = () => router.push("/");
const goBack = () => router.go(-1);

const onEditSuccess = () => {
  refetchPlaylist();
};

const onDeletePlaylist = () => {
  if (!playlistId.value) return;

  confirm.require({
    message: `Are you sure you want to delete "${playlist.value?.name}"?`,
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: async () => {
      try {
        await deletePlaylist(playlistId.value!);
        router.push("/playlists");
      } catch (error) {
        console.error("Error deleting playlist:", error);
      }
    },
  });
};
</script>
