<template>
  <div class="my-[1rem] mx-[2.5rem]">
    <Toast />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Toast } from "primevue";
import { useAuthStore } from "@/shared";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();
authStore.fetchUser();

const isLoading = ref(true);

onMounted(async () => {
  await authStore.fetchUser();
  isLoading.value = false;
});
</script>
