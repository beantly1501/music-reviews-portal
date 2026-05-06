import { ref } from "vue";
import { useAuthStore, type SongResponse, type SongCreateForm } from "@/shared";

export const useCreateSong = () => {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const { token } = useAuthStore();

  const createSong = async (
    form: SongCreateForm,
  ): Promise<SongResponse | null> => {
    if (isLoading.value) return null;
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.year !== undefined) formData.append("year", String(form.year));
      if (form.link) formData.append("link", form.link);
      if (form.cover) formData.append("cover", form.cover);
      if (form.file) formData.append("file", form.file);

      // The backend expects JSON strings for these sets/lists of IDs
      if (form.albumIds)
        formData.append("albumIds", JSON.stringify(form.albumIds));
      if (form.artistIds)
        formData.append("artistIds", JSON.stringify(form.artistIds));
      if (form.genreIds)
        formData.append("genreIds", JSON.stringify(form.genreIds));

      const response = await fetch("/api/song/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create song: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { createSong, isLoading, error };
};
