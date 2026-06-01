<script setup lang="ts">
import { ref, computed } from "vue";
import { MultiSelect, Button, InputText, useToast } from "primevue";
import { useGetAllGenres, useCreateGenre } from "@/shared";
import type { MultiSelectOptionType } from "@/shared";

defineProps<{
  invalid?: boolean;
  scrollHeight?: string;
  panelStyle?: Record<string, string>;
  placeholder?: string;
  allowCreate?: boolean;
}>();

const model = defineModel<number[]>();
const toast = useToast();

const { data: genres, isLoading, refetch } = useGetAllGenres();
const { createGenre, isLoading: isCreating } = useCreateGenre();

const genreOptions = computed<MultiSelectOptionType[]>(() =>
  genres.value?.map((g) => ({ label: g.name, value: g.id })) ?? [],
);

const newGenreName = ref("");

const onCreateGenre = async () => {
  const name = newGenreName.value.trim();
  if (!name) return;

  const ok = await createGenre(name);
  if (ok) {
    toast.add({ severity: "success", summary: `Genre "${name}" created` });
    newGenreName.value = "";
    await refetch();
  } else {
    toast.add({ severity: "error", summary: "Failed to create genre" });
  }
};
</script>

<template>
  <MultiSelect
    :options="genreOptions"
    v-model="model"
    option-label="label"
    option-value="value"
    display="chip"
    filter
    :loading="isLoading"
    :invalid="invalid"
    :scroll-height="scrollHeight"
    :panel-style="panelStyle"
    :placeholder="placeholder"
  >
    <template v-if="allowCreate" #footer>
      <div class="flex items-center gap-2 p-3 border-t border-white/10">
        <InputText
          v-model="newGenreName"
          placeholder="New genre name"
          class="flex-1 text-sm"
          @keydown.enter.prevent="onCreateGenre"
        />
        <Button
          icon="pi pi-plus"
          size="small"
          :loading="isCreating"
          :disabled="!newGenreName.trim()"
          @click.stop="onCreateGenre"
        />
      </div>
    </template>
  </MultiSelect>
</template>
