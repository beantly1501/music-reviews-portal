<template>
  <div class="py-[1rem] px-[2.5rem]">
    <Toast />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Toast } from "primevue";
import { useAuthStore } from "@/shared";

const authStore = useAuthStore();
authStore.fetchUser();
</script>
