import { getToken, PlaylistRequestData } from "@shared/utils";

export async function deletePlaylist(id: number): Promise<void> {
  const token = getToken();

  const res = await fetch(`/api/playlists/${id}`, {
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

export async function createPlaylist({
  formData,
  songIds,
  collaboratorIds,
}: PlaylistRequestData): Promise<void> {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.description != null)
    fd.append("description", formData.description);
  fd.append("isPrivate", String(!!formData.isPrivate));
  if (formData.image) fd.append("image", formData.image);
  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (collaboratorIds?.length)
    fd.append("collaboratorIds", JSON.stringify(collaboratorIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api/playlists/create`, {
    method: "POST",
    headers,
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create playlist failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}

export async function updatePlaylist({
  playlistId,
  formData,
  songIds,
  collaboratorIds,
}: PlaylistRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.append("name", formData.name);
  if (formData.description != null)
    fd.append("description", formData.description);

  if (typeof formData.isPrivate === "boolean") {
    fd.append("isPrivate", String(!!formData.isPrivate));
  }
  if (formData.image) fd.append("image", formData.image);

  if (songIds?.length) fd.append("songIds", JSON.stringify(songIds));
  if (collaboratorIds?.length)
    fd.append("collaboratorIds", JSON.stringify(collaboratorIds));

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `/api/playlists/${encodeURIComponent(String(playlistId))}/update`,
    {
      method: "PUT",
      headers,
      body: fd,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Update playlist failed: ${res.status}${text ? ` ${text}` : ""}`,
    );
  }
}
