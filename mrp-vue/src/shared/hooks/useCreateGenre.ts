import { ref } from "vue";
import { useAuthStore } from "@/shared";

export const useCreateGenre = () => {
  const isLoading = ref(false);
  const { token } = useAuthStore();

  const createGenre = async (name: string): Promise<boolean> => {
    isLoading.value = true;
    try {
      const response = await fetch("/api/genre/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { createGenre, isLoading };
};
