import { ArtistRequestData, getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function deleteArtist(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`${VITE_BACKEND_URL}/artist/${id}`, {
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
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }
    throw new Error(message);
  }
}

export async function createArtist({
  formData,
}: ArtistRequestData): Promise<void> {
  const fd = new FormData();
  fd.set("name", formData.name);
  fd.set("description", formData.description);
  if (formData.image) fd.set("image", formData.image);

  fd.set("songIds", JSON.stringify(formData.songIds ?? []));
  fd.set("albumIds", JSON.stringify(formData.albumIds ?? []));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${VITE_BACKEND_URL}/artist/create`, {
    method: "POST",
    headers,
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create failed: ${res.status}${text ? ` ${text}` : ""}`);
  }
}

export async function updateArtist({
  artistId,
  formData,
}: ArtistRequestData): Promise<void> {
  const fd = new FormData();

  if (formData.name) fd.set("name", formData.name);
  if (formData.description) fd.set("description", formData.description);
  if (formData.image) fd.set("image", formData.image);

  fd.set("songIds", JSON.stringify(formData.songIds ?? []));
  fd.set("albumIds", JSON.stringify(formData.albumIds ?? []));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${VITE_BACKEND_URL}/artist/${encodeURIComponent(String(artistId))}/update`,
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
