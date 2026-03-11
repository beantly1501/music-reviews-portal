import { ref } from "vue";
import {
  useAuthStore,
  type AlbumResponseDto,
  type AlbumCreateForm,
} from "@/shared";

export const useCreateAlbum = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const createAlbum = async (
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
      if (form.genreIds)
        formData.append("genreIds", JSON.stringify(form.genreIds));

      const response = await fetch("/api/album/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create album: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { createAlbum, isLoading, error };
};
