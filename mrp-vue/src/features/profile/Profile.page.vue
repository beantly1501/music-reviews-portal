<template>
  <div class="flex flex-col items-center gap-15">
    <UserInfo />

    <div class="flex flex-col w-full gap-4">
      <p class="flex justify-start text-4xl font-bold">My reviews</p>

      <DataTable removableSort>
        <Column field="name" header="Name" :sortable="true" />
        <Column field="type" header="Type" :sortable="true" />
        <Column field="rating" header="Rating" :sortable="true" />
        <Column field="description" header="Description" />
        <Column field="category" header="Category" :sortable="true" />
      </DataTable>
    </div>

    <div class="flex flex-col w-full gap-4">
      <div class="flex justify-between items-center">
        <p class="flex justify-start text-4xl font-bold">My playlists</p>
        <p>{totalElements} total</p>
      </div>

      <DataTable removableSort>
        <Column field="name" header="Name" :sortable="true" />
        <Column field="visibility" header="Visibility" :sortable="true" />
        <Column field="owner" header="Owner" :sortable="true" />
        <Column field="songs" header="Songs" :sortable="true" />
        <Column field="collaborators" header="Collaborators" :sortable="true" />
        <Column field="description" header="Description" />
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import UserInfo from "./UserInfo.vue";
</script>
