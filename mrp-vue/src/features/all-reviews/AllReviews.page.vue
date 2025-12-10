<template>
  <div class="flex flex-col gap-4">
    <p class="text-4xl font-bold">All Reviews</p>
    <DataTable removableSort>
      <Column field="name" header="Name" :sortable="true" />
      <Column field="type" header="Type" :sortable="true" />
      <Column field="username" header="Username" :sortable="true" />
      <Column field="rating" header="Rating" :sortable="true" />
      <Column field="description" header="Description" />
      <Column field="last_updated" header="Last updated" :sortable="true" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
</script>
