import { useEffect, useState } from "react";
import { getToken, AlbumType } from "@shared/utils";

export function useGetAlbum(id?: number) {
  const [album, setAlbum] = useState<AlbumType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAlbum(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const token = getToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    setLoading(true);
    setError(null);

    fetch(`/api/album/${id}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: AlbumType) => setAlbum(json))
      .catch((e: any) => setError(e?.message ?? "Failed to load album."))
      .finally(() => setLoading(false));
  }, [id]);

  return { album, loading, error };
}
