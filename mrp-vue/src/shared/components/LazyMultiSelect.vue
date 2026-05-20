<script setup lang="ts">
import { MultiSelect, ProgressSpinner } from "primevue";

defineProps<{
  options: { label: string; value: number }[];
  hasMore: boolean;
  loading: boolean;
  scrollHeight?: string;
  panelStyle?: Record<string, string>;
  placeholder?: string;
  invalid?: boolean;
}>();

const emit = defineEmits<{
  filter: [string];
  loadMore: [];
}>();

const model = defineModel<number[]>();
</script>

<template>
  <MultiSelect
    v-model="model"
    :options="options"
    option-label="label"
    option-value="value"
    display="chip"
    filter
    :loading="loading"
    :invalid="invalid"
    :scroll-height="scrollHeight"
    :panel-style="panelStyle"
    :placeholder="placeholder"
    @filter="(e) => emit('filter', e.value)"
  >
    <template #footer>
      <div
        v-if="hasMore"
        class="flex justify-center items-center py-2 cursor-pointer text-sm text-blue-400 hover:text-blue-300"
        @click="emit('loadMore')"
      >
        <ProgressSpinner v-if="loading" style="width: 1.25rem; height: 1.25rem" />
        <span v-else>Load more…</span>
      </div>
    </template>
  </MultiSelect>
</template>
