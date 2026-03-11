import { ref } from "vue";
import { useAuthStore } from "@/shared";

export const useDeletePlaylist = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const deletePlaylist = async (id: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to delete playlist: ${response.statusText}`);

      return true;
    } catch (err) {
      error.value = err as Error;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { deletePlaylist, isLoading, error };
};
