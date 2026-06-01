import { MenuItem } from "primereact/menuitem";

export const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL;
export const MAX_GENRES = 3;

export const TABS_MENU: MenuItem[] = [
  { label: "Newest", icon: "pi pi-clock" },
  { label: "All Reviews", icon: "pi pi-list-check" },
  { label: "Songs", icon: "pi pi-headphones" },
  { label: "Albums", icon: "pi pi-book" },
  { label: "Artists", icon: "pi pi-star-fill" },
  { label: "Playlists", icon: "pi pi-folder-open" },
  { label: "Profile", icon: "pi pi-user" },
];

export const MOBILE_TABS_MENU: MenuItem[] = [
  { icon: "pi pi-clock" },
  { icon: "pi pi-list-check" },
  { icon: "pi pi-headphones" },
  { icon: "pi pi-book" },
  { icon: "pi pi-star-fill" },
  { icon: "pi pi-folder-open" },
  { icon: "pi pi-user" },
];

export const CAT_IMAGE: string = import.meta.env.VITE_CAT_IMAGE;
