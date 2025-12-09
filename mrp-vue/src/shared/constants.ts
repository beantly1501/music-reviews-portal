import type { MenuItem } from "primevue/menuitem";

export const TABS_MENU: MenuItem[] = [
  { label: "Newest", icon: "pi pi-clock", to: "/" },
  { label: "All Reviews", icon: "pi pi-list-check", to: "/all-reviews" },
  { label: "Songs", icon: "pi pi-headphones", to: "/songs" },
  { label: "Albums", icon: "pi pi-book", to: "/albums" },
  { label: "Artists", icon: "pi pi-star-fill", to: "/artists" },
  { label: "Playlists", icon: "pi pi-folder-open", to: "/playlists" },
  { label: "Profile", icon: "pi pi-user", to: "/profile" },
];

export const MOBILE_TABS_MENU: MenuItem[] = [
  { icon: "pi pi-clock", to: "/" },
  { icon: "pi pi-list-check", to: "/all-reviews" },
  { icon: "pi pi-headphones", to: "/songs" },
  { icon: "pi pi-book", to: "/albums" },
  { icon: "pi pi-star-fill", to: "/artists" },
  { icon: "pi pi-folder-open", to: "/playlists" },
  { icon: "pi pi-user", to: "/profile" },
];
