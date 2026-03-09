<template>
  <div v-if="isLoading" class="flex justify-center p-8">
    <ProgressSpinner />
  </div>
  <div v-else-if="album" class="flex flex-col gap-4 p-4">
    <ConfirmDialog />
    <div class="flex justify-between">
      <CreateAlbumDialog
        v-if="album"
        v-model="isEditDialogVisible"
        :album="album"
        @refetchAlbums="onEditSuccess"
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
          @click="onEditAlbum"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-outlined"
          severity="danger"
          @click="onDeleteAlbum"
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
              alt="Album Image"
              image-class="object-cover w-full h-full"
              class="w-full h-full"
            />
            <ProgressSpinner v-if="!displayImageUrl && isImageLoading" />
            <i
              v-else-if="!displayImageUrl"
              class="pi pi-image text-4xl text-gray-400"
            />
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <h2 class="text-3xl font-bold m-0">{{ album.name }}</h2>
              <div class="flex items-center gap-2 text-gray-400 text-sm">
                <span class="flex items-center gap-1">
                  <i class="pi pi-calendar" /> {{ album.year }}
                </span>
                <span v-if="album.artists?.length">•</span>
                <span
                  v-if="album.artists?.length"
                  class="flex items-center gap-1"
                >
                  <i class="pi pi-user" />
                  {{ album.artists.map((a) => a.name).join(", ") }}
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-headphones" />
                  {{ album.songs?.length || 0 }} songs
                </span>
              </div>
            </div>

            <div v-if="album.genres?.length">
              <h3 class="text-lg font-semibold mb-2">Genres</h3>
              <div class="flex flex-wrap gap-2">
                <Chip
                  v-for="genre in album.genres"
                  :key="genre.id"
                  :label="genre.name"
                />
              </div>
            </div>

            <div v-if="album.link">
              <Button
                label="Open External Link"
                icon="pi pi-external-link"
                @click="openLink(album.link)"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="album.songs?.length" class="w-full">
      <template #title>Songs</template>
      <template #content>
        <DataTable
          :value="album.songs"
          row-hover
          class="cursor-pointer"
          @row-click="(e) => onSongClick(e.data.id)"
        >
          <Column field="name" header="Name" sortable />
          <Column field="year" header="Year" sortable />
          <Column header="Artists">
            <template #body="slotProps">
              {{
                slotProps.data.artists?.map((a: any) => a.name).join(", ") ||
                "N/A"
              }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Card class="w-full">
      <template #title>Reviews</template>
      <template #content>
        <DataTable
          v-if="albumReviews?.content?.length"
          :value="albumReviews.content"
          removableSort
        >
          <Column field="username" header="Reviewer" sortable />
          <Column field="grade" header="Rating" sortable>
            <template #body="slotProps">
              <Rating
                :model-value="slotProps.data.grade"
                readonly
                :cancel="false"
              />
            </template>
          </Column>
          <Column field="description" header="Description">
            <template #body="slotProps">
              <span class="line-clamp-2">{{ slotProps.data.description }}</span>
            </template>
          </Column>
          <Column field="creationDate" header="Created" sortable>
            <template #body="slotProps">
              {{ new Date(slotProps.data.creationDate).toLocaleDateString() }}
            </template>
          </Column>
          <Column field="type" header="Type" sortable>
            <template #body="slotProps">
              <Tag
                :value="'Album'"
                :severity="slotProps.data.type === 'ALBUM' ? 'success' : 'info'"
                rounded
              />
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-gray-400">No reviews yet for this album.</div>
      </template>
    </Card>
  </div>
  <div v-else class="flex justify-center p-8">
    <p>Album not found.</p>
  </div>
</template>

<script setup lang="ts">
import {
  ProgressSpinner,
  Button,
  Card,
  Rating,
  Image,
  Chip,
  DataTable,
  Column,
  Tag,
  ConfirmDialog,
} from "primevue";
import { useConfirm } from "primevue/useconfirm";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useGetAlbum, useDeleteAlbum, CreateAlbumDialog } from "@/features";
import { useGetFile } from "@/shared";
import { useGetAlbumReviews } from "@/features/review";

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const albumId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : undefined;
});

const {
  data: album,
  isLoading: isAlbumLoading,
  refetch: refetchAlbum,
} = useGetAlbum(albumId);
const { data: albumReviews, isLoading: isReviewsLoading } =
  useGetAlbumReviews(albumId);

const { deleteAlbum } = useDeleteAlbum();

const isEditDialogVisible = ref(false);

const isLoading = computed(
  () => isAlbumLoading.value || isReviewsLoading.value,
);

const { fileUrl: displayImageUrl, isLoading: isImageLoading } = useGetFile(
  computed(() => album.value?.imageUrl),
);

const goHome = () => router.push("/newest");
const goBack = () => router.go(-1);
const openLink = (link: string) => window.open(link, "_blank");

const onEditAlbum = () => {
  isEditDialogVisible.value = true;
};

const onEditSuccess = () => {
  refetchAlbum();
};

const onSongClick = (songId: number) => {
  router.push(`/song/${songId}`);
};

const onDeleteAlbum = () => {
  if (!albumId.value) return;

  confirm.require({
    message: `Are you sure you want to delete "${album.value?.name}"?`,
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
        await deleteAlbum(albumId.value!);
        router.push("/albums");
      } catch (error) {
        console.error("Error deleting album:", error);
      }
    },
  });
};
</script>
