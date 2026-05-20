<script setup lang="ts">
import { MultiSelect } from "primevue";
import type { MultiSelectOptionType } from "@/shared";

defineProps<{
  options: MultiSelectOptionType[];
  invalid?: boolean;
  loading?: boolean;
  scrollHeight?: string;
  panelStyle?: Record<string, string>;
  placeholder?: string;
}>();

const model = defineModel<number[]>();
</script>

<template>
  <MultiSelect
    :options="options"
    v-model="model"
    option-label="label"
    option-value="value"
    display="chip"
    filter
    :loading="loading"
    :invalid="invalid"
    :scroll-height="scrollHeight"
    :panel-style="panelStyle"
    :placeholder="placeholder"
  />
</template>
