import { ref } from "vue";
import { useAuthStore, type PlaylistResponseDto, type PlaylistCreateForm } from "@/shared";

export const useUpdatePlaylist = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const updatePlaylist = async (id: number, form: PlaylistCreateForm): Promise<PlaylistResponseDto | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.description) formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);
      formData.append("isPrivate", String(form.isPrivate));
      if (form.songIds) formData.append("songIds", JSON.stringify(form.songIds));
      if (form.collaboratorIds) formData.append("collaboratorIds", JSON.stringify(form.collaboratorIds));

      const response = await fetch(`/api/playlists/${id}/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to update playlist: ${response.statusText}`);

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { updatePlaylist, isLoading, error };
};
