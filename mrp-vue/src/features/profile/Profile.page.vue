<template>
  <div class="flex flex-col items-center gap-15">
    <UserInfo />

    <div class="flex flex-col w-full gap-4">
      <div class="flex justify-between items-center mb-3">
        <p class="flex justify-start text-4xl font-bold">My reviews</p>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">{{ tableData.length }} total</span>
          <Button
            :icon="`pi pi-filter${showReviewFilters ? '-slash' : ''}`"
            outlined
            @click="showReviewFilters = !showReviewFilters"
          />
        </div>
      </div>

      <DataTable
        :loading="isLoadingReviews"
        :value="tableData"
        removableSort
        stripedRows
        rowHover
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        v-model:filters="reviewFilters"
        :filterDisplay="showReviewFilters ? 'row' : undefined"
        selectionMode="single"
        class="cursor-pointer"
        emptyMessage="No reviews yet."
        @row-click="(e) => openReviewDialog(e.data)"
      >
        <Column field="name" header="Name" :sortable="true" filter :showFilterMenu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter name" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="type" header="Type" :sortable="true" filter :showFilterMenu="false">
          <template #body="{ data }: { data: ReviewTableRow }">
            <Tag
              :value="data.type === ReviewType.SONG ? 'Song' : 'Album'"
              :severity="data.type === ReviewType.ALBUM ? 'info' : 'success'"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="TYPE_OPTIONS"
              optionLabel="label"
              optionValue="value"
              placeholder="Any"
              class="w-full"
              :maxSelectedLabels="2"
              @change="filterCallback()"
            >
              <template #option="{ option }">
                <Tag :value="option.label" :severity="option.value === 'SONG' ? 'success' : 'info'" />
              </template>
              <template #value="{ value: selected }">
                <template v-if="selected?.length">
                  <Tag
                    v-for="val in selected"
                    :key="val"
                    :value="val === 'SONG' ? 'Song' : 'Album'"
                    :severity="val === 'SONG' ? 'success' : 'info'"
                    class="mr-1"
                  />
                </template>
                <span v-else>Any</span>
              </template>
            </MultiSelect>
          </template>
        </Column>

        <Column field="grade" header="Rating" :sortable="true" filter :showFilterMenu="false" dataType="numeric">
          <template #body="{ data }: { data: ReviewTableRow }">
            <Rating :modelValue="data.grade" readonly />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="GRADE_OPTIONS"
              optionLabel="label"
              optionValue="value"
              placeholder="Any"
              class="w-full"
              :maxSelectedLabels="3"
              @change="filterCallback()"
            />
          </template>
        </Column>

        <Column field="description" header="Description" filter :showFilterMenu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter description" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="creationDate" header="Creation date" :sortable="true" filter :showFilterMenu="false" dataType="date">
          <template #body="{ data }: { data: ReviewTableRow }">
            <div>
              {{ data.creationDate ? data.creationDate.toLocaleDateString("hr-HR") : "" }}
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <DatePicker
              v-model="filterModel.value"
              selectionMode="range"
              :readonlyInput="true"
              placeholder="Filter date"
              dateFormat="dd.mm.yy"
              showButtonBar
              class="w-full"
              :panelStyle="{ width: '400px' }"
              @date-select="filterCallback()"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <ReviewDialog
      v-model:visible="isReviewDialogVisible"
      :review-id="selectedReview?.id"
      :review-type="selectedReview?.type"
      @refetch="refetchMyReviews"
    />

    <div class="flex flex-col w-full gap-4">
      <div class="flex justify-between items-center">
        <p class="flex justify-start text-4xl font-bold">My playlists</p>
        <div class="flex items-center gap-2">
          <span v-if="myPlaylists?.totalElements" class="text-gray-500">{{ myPlaylists.totalElements }} total</span>
          <Button
            :icon="`pi pi-filter${showPlaylistFilters ? '-slash' : ''}`"
            outlined
            @click="showPlaylistFilters = !showPlaylistFilters"
          />
        </div>
      </div>

      <DataTable
        v-if="myPlaylists?.content?.length"
        :loading="isLoadingPlaylists"
        :value="myPlaylists?.content"
        removableSort
        stripedRows
        rowHover
        v-model:filters="playlistFilters"
        :filterDisplay="showPlaylistFilters ? 'row' : undefined"
        selectionMode="single"
        emptyMessage="No playlists yet."
        @row-click="
          (e) =>
            router.push({ name: 'playlist-details', params: { id: e.data.id } })
        "
        class="cursor-pointer"
      >
        <Column field="name" header="Name" :sortable="true" filter :showFilterMenu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter name" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="isPrivate" header="Visibility" :sortable="true" filter :showFilterMenu="false">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            <Tag
              :value="data.isPrivate ? 'Private' : 'Public'"
              :severity="data.isPrivate ? 'danger' : 'success'"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="VISIBILITY_OPTIONS"
              optionLabel="label"
              optionValue="value"
              placeholder="Any"
              class="w-full"
              :maxSelectedLabels="2"
              @change="filterCallback()"
            >
              <template #option="{ option }">
                <Tag :value="option.label" :severity="option.value ? 'danger' : 'success'" />
              </template>
              <template #value="{ value: selected }">
                <template v-if="selected?.length">
                  <Tag
                    v-for="val in selected"
                    :key="String(val)"
                    :value="val ? 'Private' : 'Public'"
                    :severity="val ? 'danger' : 'success'"
                    class="mr-1"
                  />
                </template>
                <span v-else>Any</span>
              </template>
            </MultiSelect>
          </template>
        </Column>

        <Column field="ownerUsername" header="Owner" :sortable="true" filter :showFilterMenu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter owner" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="songs" header="Songs" :sortable="true">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            {{ data.songs.length }}
          </template>
        </Column>

        <Column field="collaborators" header="Collaborators" :sortable="true">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            {{ data.collaborators.length }}
          </template>
        </Column>

        <Column field="description" header="Description" filter :showFilterMenu="false">
          <template #body="{ data }: { data: PlaylistResponseDto }">
            <div>{{ data.description ?? "-" }}</div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter description" class="w-full" @input="filterCallback()" />
          </template>
        </Column>
      </DataTable>

      <p v-else-if="!isLoadingPlaylists" class="text-gray-400">No playlists yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import UserInfo from "./UserInfo.vue";
import { useRouter } from "vue-router";
import { useGetMyReviews, useGetMyPlaylists } from "@/features/profile/hooks";
import {
  type ReviewResponse,
  ReviewType,
  type PlaylistResponseDto,
} from "@/shared";
import { Tag, Rating, Button, MultiSelect, DatePicker, InputText } from "primevue";
import { FilterMatchMode } from "@primevue/core/api";
import type { DataTableFilterMeta } from "primevue/datatable";
import ReviewDialog from "@/features/review/ReviewDialog.vue";

type ReviewTableRow = Omit<ReviewResponse, "creationDate"> & { name: string; creationDate: Date | null };

const TYPE_OPTIONS = [
  { label: "Song", value: "SONG" },
  { label: "Album", value: "ALBUM" },
];
const GRADE_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }));
const VISIBILITY_OPTIONS = [
  { label: "Public", value: false },
  { label: "Private", value: true },
];

const router = useRouter();
const {
  isLoading: isLoadingReviews,
  data: myReviews,
  refetch: refetchMyReviews,
} = useGetMyReviews();
const { isLoading: isLoadingPlaylists, data: myPlaylists } =
  useGetMyPlaylists();

const tableData = computed<ReviewTableRow[]>(() =>
  (myReviews.value ?? []).map((r) => ({
    ...r,
    name: r.type === ReviewType.SONG ? (r.songName ?? "") : (r.albumName ?? ""),
    creationDate: r.creationDate ? new Date(r.creationDate) : null,
  }))
);

const showReviewFilters = ref(false);
const reviewFilters = ref<DataTableFilterMeta>({
  name:         { value: null, matchMode: FilterMatchMode.CONTAINS },
  type:         { value: null, matchMode: FilterMatchMode.IN },
  grade:        { value: null, matchMode: FilterMatchMode.IN },
  description:  { value: null, matchMode: FilterMatchMode.CONTAINS },
  creationDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
});

const showPlaylistFilters = ref(false);
const playlistFilters = ref<DataTableFilterMeta>({
  name:          { value: null, matchMode: FilterMatchMode.CONTAINS },
  isPrivate:     { value: null, matchMode: FilterMatchMode.IN },
  ownerUsername: { value: null, matchMode: FilterMatchMode.CONTAINS },
  description:   { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const isReviewDialogVisible = ref(false);
const selectedReview = ref<ReviewResponse | null>(null);

const openReviewDialog = (review: ReviewResponse) => {
  selectedReview.value = review;
  isReviewDialogVisible.value = true;
};
</script>
