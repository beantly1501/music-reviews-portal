<template>
  <div v-if="isLoading" class="flex justify-center p-8">
    <ProgressSpinner />
  </div>
  <div v-else-if="artist" class="flex flex-col gap-4 p-4">
    <ConfirmDialog />
    <div class="flex justify-between">
      <CreateArtistDialog
        v-if="artist"
        v-model="isEditDialogVisible"
        :artist="artist"
        @refetchArtists="onEditSuccess"
      />
      <Button
        label="Home"
        icon="pi pi-home"
        class="p-button-outlined"
        @click="goHome"
      />

      <div class="flex gap-3">
        <Button
          v-if="isAdmin"
          label="Edit"
          icon="pi pi-pencil"
          class="p-button-outlined"
          severity="info"
          @click="isEditDialogVisible = true"
        />
        <Button
          v-if="isAdmin"
          label="Delete"
          icon="pi pi-trash"
          class="p-button-outlined"
          severity="danger"
          @click="onDeleteArtist"
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
              alt="Artist Image"
              image-class="object-cover w-full h-full"
              class="w-full h-full"
            />
            <ProgressSpinner v-if="!displayImageUrl && isImageLoading" />
            <i
              v-else-if="!displayImageUrl"
              class="pi pi-user text-4xl text-gray-400"
            />
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <h2 class="text-3xl font-bold m-0">{{ artist.name }}</h2>
              <div class="flex items-center gap-2 text-gray-400 text-sm">
                <span class="flex items-center gap-1">
                  <i class="pi pi-book" /> {{ artist.albums?.length || 0 }} albums
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-headphones" /> {{ artist.songs?.length || 0 }} songs
                </span>
              </div>
            </div>

            <div v-if="artist.description">
              <p class="text-gray-300">{{ artist.description }}</p>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="artist.songs?.length" class="w-full">
      <template #title>Songs</template>
      <template #content>
        <DataTable
          :value="artist.songs"
          row-hover
          class="cursor-pointer"
          @row-click="(e) => router.push(`/song/${e.data.id}`)"
        >
          <Column field="name" header="Name" sortable />
          <Column field="year" header="Year" sortable />
        </DataTable>
      </template>
    </Card>

    <Card v-if="artist.albums?.length" class="w-full">
      <template #title>Albums</template>
      <template #content>
        <DataTable
          :value="artist.albums"
          row-hover
          class="cursor-pointer"
          @row-click="(e) => router.push(`/album/${e.data.id}`)"
        >
          <Column field="name" header="Name" sortable />
        </DataTable>
      </template>
    </Card>
  </div>
  <div v-else class="flex justify-center p-8">
    <p>Artist not found.</p>
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
import { useGetFile, useAuthStore } from "@/shared";
import { useGetArtist } from "./hooks/useGetArtist";
import { useDeleteArtist } from "./hooks/useDeleteArtist";
import CreateArtistDialog from "./CreateArtistDialog.vue";
import { Role } from "@/features";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const { user } = storeToRefs(useAuthStore());
const isAdmin = computed(() => user.value?.role === Role.ADMIN);

const artistId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : undefined;
});

const {
  data: artist,
  isLoading: isArtistLoading,
  refetch: refetchArtist,
} = useGetArtist(artistId);

const { deleteArtist } = useDeleteArtist();

const isEditDialogVisible = ref(false);
const isLoading = computed(() => isArtistLoading.value);

const { fileUrl: displayImageUrl, isLoading: isImageLoading } = useGetFile(
  computed(() => artist.value?.imageUrl),
);

const goHome = () => router.push("/");
const goBack = () => router.go(-1);

const onEditSuccess = () => {
  refetchArtist();
};

const onDeleteArtist = () => {
  if (!artistId.value) return;

  confirm.require({
    message: `Are you sure you want to delete "${artist.value?.name}"?`,
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
        await deleteArtist(artistId.value!);
        router.push("/artists");
      } catch (error) {
        console.error("Error deleting artist:", error);
      }
    },
  });
};
</script>
