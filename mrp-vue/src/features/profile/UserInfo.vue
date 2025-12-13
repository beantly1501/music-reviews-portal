<template>
  <Card v-if="user" class="max-w-[400px] mt-10">
    <template #content>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <span class="font-bold w-8rem">Username:</span>
          <span>{{ user.username }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-bold w-8rem">Email:</span>
          <span>{{ user.email }}</span>
        </div>

        <div class="flex justify-end">
          <Button icon="pi pi-sign-out" label="Log out" @click="handleLogout" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Button } from "primevue";
import { useAuthStore } from "@/shared";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();

const { user } = storeToRefs(authStore);
const { logout } = authStore;

function handleLogout() {
  logout();
}
</script>
