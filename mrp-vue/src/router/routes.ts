import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from "vue-router";
import { Layout, Test } from "@/shared/components";
import {
  AlbumsPage,
  AlbumDetailsPage,
  LoginPage,
  NewestPage,
  ProfilePage,
  UserPage,
  RegisterPage,
} from "@/features";
import { AllReviewsPage } from "@/features/all-reviews";
import { SongsPage } from "@/features/songs";
import SongDetails from "@/features/songs/SongDetails.page.vue";
import { ArtistsPage, ArtistDetailsPage } from "@/features/artists";
import { PlaylistsPage, PlaylistDetailsPage } from "@/features/playlists";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: Layout,
    children: [
      { path: "", name: "home", component: NewestPage },
      { path: "all-reviews", name: "all-reviews", component: AllReviewsPage },
      { path: "songs", name: "songs", component: SongsPage },
      { path: "albums", name: "albums", component: AlbumsPage },
      { path: "artists", name: "artists", component: ArtistsPage },
      { path: "playlists", name: "playlists", component: PlaylistsPage },
      { path: "profile", name: "profile", component: ProfilePage },
      { path: "user/:id", name: "user", component: UserPage },
    ],
  },
  { path: "/song/:id", name: "song-details", component: SongDetails },
  { path: "/album/:id", name: "album-details", component: AlbumDetailsPage },
  { path: "/artist/:id", name: "artist-details", component: ArtistDetailsPage },
  { path: "/playlist/:id", name: "playlist-details", component: PlaylistDetailsPage },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/register", name: "register", component: RegisterPage },
  { path: "/:pathMatch(.*)*", name: "error", component: Test },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return token !== null && token !== "";
};

router.beforeEach(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authenticated = isAuthenticated();

    const publicRoutes: string[] = ["login", "register"];
    const isPublicRoute =
      typeof to.name === "string" && publicRoutes.includes(to.name);

    if (!authenticated && !isPublicRoute) {
      next({ name: "login" });
    } else if (
      authenticated &&
      typeof to.name === "string" &&
      publicRoutes.includes(to.name)
    ) {
      next({ name: "home" });
    } else {
      next();
    }
  },
);

export default router;
