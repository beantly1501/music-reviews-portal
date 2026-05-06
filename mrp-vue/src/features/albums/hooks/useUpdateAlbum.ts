import { ref } from "vue";
import {
  useAuthStore,
  type AlbumResponseDto,
  type AlbumCreateForm,
} from "@/shared";

export const useUpdateAlbum = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const updateAlbum = async (
    id: number,
    form: AlbumCreateForm,
  ): Promise<AlbumResponseDto | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.year !== undefined) formData.append("year", String(form.year));
      if (form.link) formData.append("link", form.link);
      if (form.cover) formData.append("cover", form.cover);

      if (form.songIds)
        formData.append("songIds", JSON.stringify(form.songIds));
      if (form.artistIds)
        formData.append("artistIds", JSON.stringify(form.artistIds));

      const response = await fetch(`/api/album/${id}/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update album: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { updateAlbum, isLoading, error };
};
