import { AlbumRequestData, getToken } from "@shared/utils";

export async function createAlbum({
  formData,
}: AlbumRequestData): Promise<void> {
  const fd = new FormData();
  fd.set("name", formData.name);
  if (formData.link) fd.set("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.set("year", String(formData.year));
  }
  if (formData.cover) fd.set("cover", formData.cover);
  if (formData.songIds?.length)
    fd.set("songIds", JSON.stringify(formData.songIds));
  if (formData.artistIds?.length)
    fd.set("artistIds", JSON.stringify(formData.artistIds));

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
}: AlbumRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.set("name", formData.name);
  if (formData.link) fd.set("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.set("year", String(formData.year));
  }
  if (formData.cover) fd.set("cover", formData.cover);
  fd.set(
    "songIds",
    formData.songIds?.length
      ? JSON.stringify(formData.songIds)
      : JSON.stringify([]),
  );
  fd.set(
    "artistIds",
    formData.artistIds?.length
      ? JSON.stringify(formData.artistIds)
      : JSON.stringify([]),
  );

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
