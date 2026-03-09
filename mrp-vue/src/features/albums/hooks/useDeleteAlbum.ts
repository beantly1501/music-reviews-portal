import { ref } from "vue";
import { useAuthStore } from "@/shared";

export const useDeleteAlbum = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const deleteAlbum = async (id: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/album/${id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete album: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      error.value = err as Error;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { deleteAlbum, isLoading, error };
};
