import { getToken, SongRequestData } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function deleteSong(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`${VITE_BACKEND_URL}/song/${id}`, {
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

export async function createSong({ formData }: SongRequestData): Promise<void> {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (formData.file) fd.append("file", formData.file);

  if (formData.genreIds?.length)
    fd.append("genreIds", JSON.stringify(formData.genreIds));
  if (formData.albumIds?.length)
    fd.append("albumIds", JSON.stringify(formData.albumIds));
  if (formData.artistIds?.length)
    fd.append("artistIds", JSON.stringify(formData.artistIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${VITE_BACKEND_URL}/song/create`, {
    method: "POST",
    headers,
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create failed: ${res.status}${text ? ` ${text}` : ""}`);
  }
}

export async function updateSong({
  songId,
  formData,
}: SongRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (formData.file) fd.append("file", formData.file);
  fd.set(
    "genreIds",
    formData.genreIds?.length
      ? JSON.stringify(formData.genreIds)
      : JSON.stringify([]),
  );
  fd.set(
    "albumIds",
    formData.albumIds?.length
      ? JSON.stringify(formData.albumIds)
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
    `${VITE_BACKEND_URL}/song/${encodeURIComponent(String(songId))}/update`,
    {
      method: "PUT",
      headers,
      body: fd,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Update failed: ${res.status}${text ? ` ${text}` : ""}`);
  }
}
