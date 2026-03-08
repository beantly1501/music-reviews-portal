import { useAuthStore } from "@/shared";

export const useDeleteSong = () => {
  const { token } = useAuthStore();

  const deleteSong = async (id: number) => {
    const url = `/api/song/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete song: ${response.status}`);
    }

    return true;
  };

  return { deleteSong };
};
