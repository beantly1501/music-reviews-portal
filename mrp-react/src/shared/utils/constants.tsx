import { MenuItem } from "primereact/menuitem";
import { SongOrAlbumEnum } from "./enums.tsx";

export const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL;

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
  { icon: "pi pi-user" },
];

export const CAT_IMAGE: string = import.meta.env.VITE_CAT_IMAGE;

export const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Back in Black",
    image: CAT_IMAGE,
    date: "2-8-2024",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "albumaddict",
    description:
      "A hard-rock classic by AC/DC, driven by its signature riff and high-energy vocals.",
  },
  {
    id: 2,
    name: "Billie Jean",
    image: CAT_IMAGE,
    date: "27-3-2025",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "groove_guru",
    description:
      "Michael Jackson’s iconic pop track, famous for that unforgettable bass line and moonwalk legend.Michael Jackson’s iconic pop track, famous for that unforgettable bass line and moonwalk legend.Michael Jackson’s iconic pop track, famous for that unforgettable bass line and moonwalk legend.Michael Jackson’s iconic pop track, famous for that unforgettable bass line and moonwalk legend.Michael Jackson’s iconic pop track, famous for that unforgettable bass line and moonwalk legend.",
  },
  {
    id: 3,
    name: "Like a Rolling Stone",
    image: CAT_IMAGE,
    date: "10-11-2024",
    rating: 3,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "melody_mike",
    description:
      "Bob Dylan’s groundbreaking 1965 song—poetic, biting, and revolutionary for its time.",
  },
  {
    id: 4,
    name: "Bohemian Rhapsody",
    image: CAT_IMAGE,
    date: "30-7-2025",
    rating: 5,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "groove_guru",
    description:
      "Queen’s operatic rock opus blending multiple genres into one epic six-minute suite.",
  },
  {
    id: 5,
    name: "Wish You Were Here",
    image: CAT_IMAGE,
    date: "29-6-2025",
    rating: 4,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "jbockal",
    description:
      "Pink Floyd’s nostalgic acoustic ballad about absence, memory, and longing.",
  },
  {
    id: 6,
    name: "Hotel California",
    image: CAT_IMAGE,
    date: "4-5-2024",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "soundwave_sam",
    description:
      "The Eagles’ legendary track—haunting lyrics, dual guitar solos, and an enigmatic story.",
  },
  {
    id: 7,
    name: "Wish You Were Here",
    image: CAT_IMAGE,
    date: "27-12-2024",
    rating: 4,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "vinylvicky",
    description:
      "A heartfelt reminder of friendship and the emotional distance time can create.",
  },
  {
    id: 8,
    name: "Hotel California",
    image: CAT_IMAGE,
    date: "19-3-2025",
    rating: 4,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "musicman22",
    description:
      "A classic track evoking desert highways, excess, and metaphorical entrapment.",
  },
  {
    id: 9,
    name: "Stairway to Heaven",
    image: CAT_IMAGE,
    date: "12-2-2025",
    rating: 2,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "beatmeister",
    description:
      "Led Zeppelin’s epic journey from gentle folk to roaring hard rock crescendo.",
  },
  {
    id: 10,
    name: "Purple Rain",
    image: CAT_IMAGE,
    date: "28-10-2024",
    rating: 4,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "jbockal",
    description:
      "Prince’s soulful power ballad showcasing both his guitar prowess and emotional depth.",
  },
  {
    id: 11,
    name: "Bohemian Rhapsody",
    image: CAT_IMAGE,
    date: "17-11-2025",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "rocknroll_ralf",
    description:
      "An operatic rock masterpiece that redefined what a single could be.",
  },
  {
    id: 12,
    name: "Wish You Were Here",
    image: CAT_IMAGE,
    date: "24-6-2024",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "albumaddict",
    description:
      "An emotive acoustic piece capturing the pain of absence and nostalgia.",
  },
  {
    id: 13,
    name: "Wish You Were Here",
    image: CAT_IMAGE,
    date: "21-7-2025",
    rating: 5,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "beatmeister",
    description:
      "A timeless ballad blending rich melodies with poignant, introspective lyrics.",
  },
  {
    id: 14,
    name: "Smells Like Teen Spirit",
    image: CAT_IMAGE,
    date: "15-4-2024",
    rating: 1,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "groove_guru",
    description:
      "Nirvana’s grunge anthem that captured a generation’s disillusionment and raw energy.",
  },
  {
    id: 15,
    name: "Purple Rain",
    image: CAT_IMAGE,
    date: "23-8-2025",
    rating: 3,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "soundwave_sam",
    description:
      "Prince’s signature hit merging rock, R&B, and gospel for a truly epic feel.",
  },
  {
    id: 16,
    name: "Like a Rolling Stone",
    image: CAT_IMAGE,
    date: "17-4-2025",
    rating: 4,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "tuned_in_tam",
    description:
      "A seminal folk-rock track noted for its biting social commentary and Dylan’s vocals.",
  },
  {
    id: 17,
    name: "Hotel California",
    image: CAT_IMAGE,
    date: "9-7-2024",
    rating: 3,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "musicman22",
    description:
      "Eagles’ haunting track exploring themes of fame, decadence, and entrapment.",
  },
  {
    id: 18,
    name: "Wish You Were Here",
    image: CAT_IMAGE,
    date: "11-9-2025",
    rating: 2,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "groove_guru",
    description:
      "A poignant reflection on isolation and the bonds we miss when apart.",
  },
  {
    id: 19,
    name: "Hotel California",
    image: CAT_IMAGE,
    date: "25-8-2025",
    rating: 3,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "rocknroll_ralf",
    description:
      "A haunting tune illustrating the darker side of fame and luxury.",
  },
  {
    id: 20,
    name: "Purple Rain",
    image: CAT_IMAGE,
    date: "16-5-2025",
    rating: 2,
    songOrAlbum: SongOrAlbumEnum.SONG,
    username: "rocknroll_ralf",
    description:
      "An emotional epic that captures pain and redemption in a musical journey.",
  },
];
