<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <p class="text-4xl font-bold">All Reviews</p>
      <div class="flex items-center gap-2">
        <span v-if="reviews?.length" class="text-gray-500">{{ reviews.length }} total</span>
        <Button
          v-if="reviews?.length"
          :icon="`pi pi-filter${showFilters ? '-slash' : ''}`"
          outlined
          @click="showFilters = !showFilters"
        />
      </div>
    </div>

    <div>
      <div class="card flex justify-center" v-if="isLoading">
        <ProgressSpinner />
      </div>

      <p v-else-if="!reviews?.length" class="text-center text-gray-500">No reviews yet...</p>

      <DataTable
        v-else
        row-hover
        class="cursor-pointer"
        :value="tableData"
        removableSort
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        v-model:filters="filters"
        :filterDisplay="showFilters ? 'row' : undefined"
        selectionMode="single"
        emptyMessage="No reviews found."
        @row-click="onRowClick"
      >
        <Column field="name" header="Name" :sortable="true" filter :showFilterMenu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter name" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="type" header="Type" :sortable="true" filter :showFilterMenu="false">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.type === 'SONG' ? 'Song' : 'Album'"
              :severity="slotProps.data.type === 'SONG' ? 'success' : 'info'"
              rounded
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

        <Column field="username" header="Username" :sortable="true" filter :showFilterMenu="false">
          <template #body="slotProps">
            <p class="font-bold">{{ slotProps.data.username }}</p>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter username" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="grade" header="Rating" :sortable="true" filter :showFilterMenu="false" dataType="numeric">
          <template #body="slotProps">
            <Rating :model-value="slotProps.data.grade" readonly :cancel="false" />
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
          <template #body="slotProps">
            <span class="line-clamp-2">{{ slotProps.data.description }}</span>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" placeholder="Filter description" class="w-full" @input="filterCallback()" />
          </template>
        </Column>

        <Column field="creationDate" header="Last updated" :sortable="true" filter :showFilterMenu="false" dataType="date">
          <template #body="slotProps">
            {{ slotProps.data.creationDate ? slotProps.data.creationDate.toLocaleDateString('hr-HR') : "" }}
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
      v-if="selectedReview"
      v-model:visible="showDialog"
      :key="`${selectedReview.type}-${selectedReview.id}`"
      :review-id="selectedReview.id"
      :review-type="selectedReview.type"
      @refetch="refetchReviews"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable, { type DataTableRowClickEvent } from "primevue/datatable";
import Column from "primevue/column";
import { Rating, Tag, ProgressSpinner, Button, MultiSelect, DatePicker, InputText } from "primevue";
import { FilterMatchMode } from "@primevue/core/api";
import type { DataTableFilterMeta } from "primevue/datatable";
import { useGetAllReviews } from "@/features/review";
import { ReviewDialog } from "@/features/review";
import type { ReviewResponse } from "@/shared";

type ReviewTableRow = Omit<ReviewResponse, "creationDate"> & { name: string; creationDate: Date | null };

const TYPE_OPTIONS = [
  { label: "Song", value: "SONG" },
  { label: "Album", value: "ALBUM" },
];
const GRADE_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }));

const { data: reviews, isLoading, refetch: refetchReviews } = useGetAllReviews();

const tableData = computed<ReviewTableRow[]>(() =>
  (reviews.value ?? []).map((r) => ({
    ...r,
    name: r.songName ?? r.albumName ?? "",
    creationDate: r.creationDate ? new Date(r.creationDate) : null,
  }))
);

const showFilters = ref(false);
const filters = ref<DataTableFilterMeta>({
  name:         { value: null, matchMode: FilterMatchMode.CONTAINS },
  type:         { value: null, matchMode: FilterMatchMode.IN },
  username:     { value: null, matchMode: FilterMatchMode.CONTAINS },
  grade:        { value: null, matchMode: FilterMatchMode.IN },
  description:  { value: null, matchMode: FilterMatchMode.CONTAINS },
  creationDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
});

const showDialog = ref(false);
const selectedReview = ref<ReviewResponse | null>(null);

const onRowClick = (event: DataTableRowClickEvent) => {
  selectedReview.value = event.data as ReviewResponse;
  showDialog.value = true;
};
</script>
