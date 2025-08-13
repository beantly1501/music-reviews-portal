import { AlbumRequestData, getToken } from "@shared/utils";

export async function createAlbum({
  formData,
  songIds,
  artistIds,
}: AlbumRequestData): Promise<void> {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (artistIds?.length) fd.append("artistIds", JSON.stringify(artistIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/album/create", {
    method: "POST",
    headers,
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create album failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}

export async function updateAlbum({
  albumId,
  formData,
  songIds,
  artistIds,
}: AlbumRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (artistIds?.length) fd.append("artistIds", JSON.stringify(artistIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `/api/album/${encodeURIComponent(String(albumId))}/update`,
    {
      method: "PUT",
      headers,
      body: fd,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Update album failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}

export async function deleteAlbum(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`/api/album/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (res.status === 204) return;

  if (!res.ok) {
    let message = `Delete failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      //
    }
    throw new Error(message);
  }
}
