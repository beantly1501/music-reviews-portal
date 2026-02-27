import { onMounted, onUnmounted, ref, type Ref, watch } from "vue";
import { useAuthStore } from "@/shared";

export const useGetFile = (
  url: Ref<string | undefined> | string | undefined,
) => {
  const fileUrl = ref<string | undefined>(undefined);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const { token } = useAuthStore();

  const fetchFile = async (currentUrl: string | undefined) => {
    if (!currentUrl || currentUrl.trim() === "") {
      fileUrl.value = undefined;
      return;
    }

    isLoading.value = true;
    error.value = null;

    const fullUrl = currentUrl.startsWith("/api")
      ? currentUrl
      : `/api${currentUrl}`;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const blob = await response.blob();
      if (blob.size === 0) {
        fileUrl.value = undefined;
        return;
      }

      fileUrl.value = URL.createObjectURL(blob);
    } catch (e) {
      error.value = e as Error;
    } finally {
      isLoading.value = false;
    }
  };

  const cleanup = () => {
    if (fileUrl.value) {
      URL.revokeObjectURL(fileUrl.value);
      fileUrl.value = undefined;
    }
  };

  onMounted(() => {
    const initialUrl = typeof url === "object" ? url.value : url;
    fetchFile(initialUrl);
  });

  if (typeof url === "object") {
    watch(url, (newUrl) => {
      cleanup();
      fetchFile(newUrl);
    });
  }

  onUnmounted(() => {
    cleanup();
  });

  return { fileUrl, isLoading, error };
};
