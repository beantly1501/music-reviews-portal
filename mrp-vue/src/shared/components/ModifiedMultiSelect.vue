<script setup lang="ts">
import { MultiSelect } from "primevue";
import type { MultiSelectOptionType } from "@/shared";

defineProps<{
  options: MultiSelectOptionType[];
  invalid?: boolean;
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
  />
</template>
