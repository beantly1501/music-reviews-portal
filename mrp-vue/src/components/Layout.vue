<script setup>
import { ref } from "vue";
import TabMenu from "primevue/tabmenu";

const isMobile = ref(false);
const activeIndex = ref(0);
const model = ref([
  "/",
  "/all-reviews",
  "/songs",
  "/albums",
  "/artists",
  "/playlists",
  `/profile`,
]);

const changeTab = (event) => {
  activeIndex.value = event.index;
};
</script>

<template>
  <div class="flex flex-column">
    <TabMenu
      :pt="{
        menu: { style: { justifyContent: isMobile ? 'space-between' : '' } },
        icon: { style: { fontSize: isMobile ? '1.5rem' : '' } },
      }"
      :model="model"
      class="mx-auto text-center w-full md:w-auto"
      :active-index="activeIndex"
      @tab-change="changeTab"
    />
    <div class="m-5">
      <router-view />
    </div>
  </div>
</template>
