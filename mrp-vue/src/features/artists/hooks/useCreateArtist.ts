import { ref } from "vue";
import { useAuthStore, type ArtistResponseDto, type ArtistCreateForm } from "@/shared";

export const useCreateArtist = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const createArtist = async (form: ArtistCreateForm): Promise<ArtistResponseDto | null> => {
    if (isLoading.value) return null;
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.description) formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);
      if (form.songIds) formData.append("songIds", JSON.stringify(form.songIds));
      if (form.albumIds) formData.append("albumIds", JSON.stringify(form.albumIds));

      const response = await fetch("/api/artist/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to create artist: ${response.statusText}`);

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { createArtist, isLoading, error };
};
