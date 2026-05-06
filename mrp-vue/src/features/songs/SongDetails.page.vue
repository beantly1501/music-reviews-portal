<template>
  <div v-if="isLoading" class="flex justify-center p-8">
    <ProgressSpinner />
  </div>
  <div v-else-if="song" class="flex flex-col gap-4 p-4">
    <ConfirmDialog />
    <div class="flex justify-between">
      <CreateSongDialog
        v-if="song"
        v-model="isEditDialogVisible"
        :song="song"
        @refetchSongs="onEditSuccess"
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
          @click="onEditSong"
        />
        <Button
          v-if="isAdmin"
          label="Delete"
          icon="pi pi-trash"
          class="p-button-outlined"
          severity="danger"
          @click="onDeleteSong"
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
              alt="Song Image"
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
              <h2 class="text-3xl font-bold m-0">{{ song.name }}</h2>
              <div class="flex items-center gap-2 text-gray-400 text-sm">
                <span class="flex items-center gap-1">
                  <i class="pi pi-calendar" /> {{ song.year }}
                </span>
                <span v-if="song.artists?.length">•</span>
                <span
                  v-if="song.artists?.length"
                  class="flex items-center gap-1"
                >
                  <i class="pi pi-user" />
                  {{ song.artists.map((a) => a.name).join(", ") }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-4 justify-center items-center mt-4">
              <audio v-if="audioUrl" controls :src="audioUrl" @click.stop />
              <ProgressSpinner v-else-if="isAudioLoading" />
              <div v-else>
                <p class="text-gray-400 h-2rem text-sm italic">
                  No audio file available.
                </p>
              </div>
            </div>

            <div v-if="song.genres?.length">
              <h3 class="text-lg font-semibold mb-2">Genres</h3>
              <div class="flex flex-wrap gap-2">
                <Chip
                  v-for="genre in song.genres"
                  :key="genre.id"
                  :label="genre.name"
                />
              </div>
            </div>

            <div v-if="song.link">
              <Button
                label="Open External Link"
                icon="pi pi-external-link"
                @click="openLink(song.link)"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="song.albums?.length" class="w-full">
      <template #title>Albums</template>
      <template #content>
        <DataTable :value="song.albums" removableSort :row-hover="true" class="cursor-pointer" @row-click="(e) => router.push({ name: 'album-details', params: { id: e.data.id } })">
          <Column field="name" header="Name" sortable>
            <template #body="slotProps">
              <span
              >{{ slotProps.data.name }}</span>
            </template>
          </Column>
          <Column field="year" header="Year" sortable>
            <template #body="slotProps">
              <span
              >{{ slotProps.data.year }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Card class="w-full">
      <template #title>Reviews</template>
      <template #content>
        <DataTable
          v-if="songReviews?.content?.length"
          :value="songReviews.content"
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
                :value="'Song'"
                :severity="slotProps.data.type === 'SONG' ? 'success' : 'info'"
                rounded
              />
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-gray-400">No reviews yet for this song.</div>
      </template>
    </Card>
  </div>
  <div v-else class="flex justify-center p-8">
    <p>Song not found.</p>
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
import { useGetSong, useDeleteSong, CreateSongDialog, Role } from "@/features";
import { useGetFile, useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";
import { useGetSongReviews } from "@/features/review";

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const { user } = storeToRefs(useAuthStore());
const isAdmin = computed(() => user.value?.role === Role.ADMIN);

const songId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : undefined;
});

const {
  data: song,
  isLoading: isSongLoading,
  refetch: refetchSong,
} = useGetSong(songId);
const { data: songReviews, isLoading: isReviewsLoading } =
  useGetSongReviews(songId);

const { deleteSong } = useDeleteSong();

const isEditDialogVisible = ref(false);

const isLoading = computed(() => isSongLoading.value || isReviewsLoading.value);

const { fileUrl: displayImageUrl, isLoading: isImageLoading } = useGetFile(
  computed(() => song.value?.imageUrl),
);

const { fileUrl: audioUrl, isLoading: isAudioLoading } = useGetFile(
  computed(() => song.value?.fileUrl),
);

const goHome = () => router.push("/");
const goBack = () => router.go(-1);
const openLink = (link: string) => window.open(link, "_blank");

const onEditSong = () => {
  isEditDialogVisible.value = true;
};

const onEditSuccess = () => {
  refetchSong();
};

const onDeleteSong = () => {
  if (!songId.value) return;

  confirm.require({
    message: `Are you sure you want to delete "${song.value?.name}"?`,
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
        await deleteSong(songId.value!);
        router.push("/");
      } catch (error) {
        console.error("Error deleting song:", error);
      }
    },
  });
};
</script>
