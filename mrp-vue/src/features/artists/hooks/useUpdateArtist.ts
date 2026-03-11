import { ref } from "vue";
import { useAuthStore, type ArtistResponseDto, type ArtistCreateForm } from "@/shared";

export const useUpdateArtist = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const updateArtist = async (id: number, form: ArtistCreateForm): Promise<ArtistResponseDto | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.description) formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);
      if (form.songIds) formData.append("songIds", JSON.stringify(form.songIds));
      if (form.albumIds) formData.append("albumIds", JSON.stringify(form.albumIds));

      const response = await fetch(`/api/artist/${id}/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to update artist: ${response.statusText}`);

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { updateArtist, isLoading, error };
};
