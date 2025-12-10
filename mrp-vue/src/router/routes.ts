import { createRouter, createWebHistory } from "vue-router";
import { Layout, Test } from "../components";
import { ProfilePage } from "../features";
import { AllReviewsPage } from "../features/all-reviews";

const routes = [
  {
    path: "/",
    component: Layout,
    children: [
      { path: "", name: "home", component: Test },
      { path: "all-reviews", name: "all-reviews", component: AllReviewsPage },
      { path: "songs", name: "songs", component: Test },
      { path: "albums", name: "albums", component: Test },
      { path: "artists", name: "artists", component: Test },
      { path: "playlists", name: "playlists", component: Test },
      { path: "profile", name: "profile", component: ProfilePage },
      { path: "user/:id", name: "user", component: Test },
    ],
  },
  { path: "/song/:id", name: "song-details", component: Test },
  { path: "/album/:id", name: "album-details", component: Test },
  { path: "/artist/:id", name: "artist-details", component: Test },
  { path: "/playlist/:id", name: "playlist-details", component: Test },
  { path: "/login", name: "login", component: Test },
  { path: "/register", name: "register", component: Test },
  { path: "/:pathMatch(.*)*", name: "error", component: Test },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
