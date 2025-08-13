import { ArtistRequestData, getToken } from "@shared/utils";

export async function deleteArtist(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`/api/artist/${id}`, {
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
  albumIds,
  songIds,
}: ArtistRequestData): Promise<void> {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.description) fd.append("description", formData.description);
  if (formData.image) fd.append("image", formData.image);
  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (albumIds?.length) fd.append("albumIds", JSON.stringify(albumIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/artist/create", {
    method: "POST",
    headers, // let the browser set multipart boundary
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create artist failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}

export async function updateArtist({
  artistId,
  formData,
  songIds,
  albumIds,
}: ArtistRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.append("name", formData.name);
  if (formData.description !== undefined && formData.description !== null)
    fd.append("description", formData.description);
  if (formData.image) fd.append("image", formData.image);
  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (albumIds?.length) fd.append("albumIds", JSON.stringify(albumIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `/api/artist/${encodeURIComponent(String(artistId))}/update`,
    {
      method: "PUT",
      headers,
      body: fd,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Update artist failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}
