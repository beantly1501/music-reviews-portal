import { ref, onMounted, watch, nextTick, type Ref } from "vue";
import { useAuthStore } from "@/shared";

interface UseFetchOptions {
  page?: Ref<number> | number;
  size?: Ref<number> | number;
  immediate?: boolean;
}

export const useFetch = <T>(
  url: Ref<string | undefined> | string,
  options: UseFetchOptions = {},
) => {
  const { page, size, immediate = true } = options;

  const isLoading = ref(immediate);
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);

  const { token } = useAuthStore();

  const buildUrl = () => {
    const params = new URLSearchParams();

    const pageValue = typeof page === "object" ? page.value : page;
    const sizeValue = typeof size === "object" ? size.value : size;

    if (pageValue !== undefined) params.append("page", String(pageValue));
    if (sizeValue !== undefined) params.append("size", String(sizeValue));

    const query = params.toString();
    const baseUrl = typeof url === "object" ? url.value : url;

    if (!baseUrl) return null;

    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  const fetchData = async () => {
    const finalUrl = buildUrl();
    if (!finalUrl) {
      data.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(finalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      data.value = await response.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      await nextTick();
      isLoading.value = false;
    }
  };

  onMounted(async () => {
    if (immediate) {
      await fetchData();
    }
  });

  if (typeof page === "object") watch(page, fetchData);
  if (typeof size === "object") watch(size, fetchData);
  if (typeof url === "object") watch(url, fetchData);

  return { isLoading, data, error, refetch: fetchData };
};
