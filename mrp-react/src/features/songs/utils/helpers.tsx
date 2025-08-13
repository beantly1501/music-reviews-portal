import { getToken, SongRequestData } from "@shared/utils";

export async function deleteSong(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`/api/song/${id}`, {
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

export async function createSong({
  formData,
  albumIds,
  artistIds,
  genreIds,
}: SongRequestData): Promise<void> {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (formData.file) fd.append("file", formData.file);

  if (genreIds?.length) fd.append("genreIds", JSON.stringify(genreIds));
  if (albumIds?.length) fd.append("albumIds", JSON.stringify(albumIds));
  if (artistIds?.length) fd.append("artistIds", JSON.stringify(artistIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/song/create", {
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
  albumIds,
  artistIds,
  genreIds,
}: SongRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.append("name", formData.name);
  if (formData.link) fd.append("link", formData.link);
  if (formData.year !== undefined && formData.year !== null) {
    fd.append("year", String(formData.year));
  }
  if (genreIds?.length) {
    fd.append("genreIds", JSON.stringify(genreIds));
  }
  if (formData.cover) fd.append("cover", formData.cover);
  if (formData.file) fd.append("file", formData.file);
  if (albumIds?.length) fd.append("albumIds", JSON.stringify(albumIds));
  if (artistIds?.length) fd.append("artistIds", JSON.stringify(artistIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `/api/song/${encodeURIComponent(String(songId))}/update`,
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
