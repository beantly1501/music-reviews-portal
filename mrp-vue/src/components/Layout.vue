<script setup>
import TabMenu from "primevue/tabmenu";
import { MOBILE_TABS_MENU, TABS_MENU } from "@/shared/constants.ts";
import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";
import { useRoute } from "vue-router";
import router from "@/router/index.ts";

const route = useRoute();
const isMobile = useMediaQuery("(max-width: 850px)");

const model = computed(() => (isMobile.value ? MOBILE_TABS_MENU : TABS_MENU));

const TAB_PATHS = [
  "/",
  "/all-reviews",
  "/songs",
  "/albums",
  "/artists",
  "/playlists",
  "/profile",
];

const activeIndex = computed(() => {
  const i = TAB_PATHS.findIndex((path) => path === route.path);
  return i >= 0 ? i : 0;
});

const changeTab = (e) => {
  const path = TAB_PATHS[e.index];
  if (path) router.push(path);
};
</script>

<template>
  <div class="mt-3">
    <TabMenu
      :model="model"
      :active-index="activeIndex"
      @tabChange="changeTab"
      class="bg-transparent"
    />
    <router-view />
  </div>
</template>
