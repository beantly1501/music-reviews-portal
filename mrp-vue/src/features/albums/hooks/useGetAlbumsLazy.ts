import { ref } from "vue";
import { useAuthStore } from "@/shared";
import type { AlbumResponseDto, Page } from "@/shared";

export type AlbumOption = { id: number; name: string; year?: number | null };

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export const useGetAlbumsLazy = () => {
  const items = ref<AlbumOption[]>([]);
  const hasMore = ref(false);
  const isLoading = ref(false);

  let query = "";
  let page = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const { token } = useAuthStore();

  const fetchPage = async (q: string, pageNum: number) => {
    isLoading.value = true;
    try {
      const params = new URLSearchParams({ page: String(pageNum), size: String(PAGE_SIZE) });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/album/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Page<AlbumResponseDto> = await res.json();
      const incoming: AlbumOption[] = data.content.map((a) => ({ id: a.id, name: a.name, year: a.year }));
      page = pageNum;
      hasMore.value = pageNum + 1 < data.totalPages;
      items.value = pageNum === 0 ? incoming : [...items.value, ...incoming];
    } catch {
      // silently ignore
    } finally {
      isLoading.value = false;
    }
  };

  const onFilter = (q: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      query = q;
      void fetchPage(q, 0);
    }, DEBOUNCE_MS);
  };

  const loadMore = () => {
    if (!hasMore.value || isLoading.value) return;
    void fetchPage(query, page + 1);
  };

  const initialize = () => {
    query = "";
    page = 0;
    items.value = [];
    hasMore.value = false;
    void fetchPage("", 0);
  };

  return { items, hasMore, isLoading, onFilter, loadMore, initialize };
};
