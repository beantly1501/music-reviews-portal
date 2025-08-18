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
}: PlaylistRequestData): Promise<void> {
  const fd = new FormData();
  fd.set("name", formData.name);
  if (formData.description != null) fd.set("description", formData.description);
  fd.set("isPrivate", String(!!formData.isPrivate));
  if (formData.image) fd.set("image", formData.image as File);

  fd.set("songIds", JSON.stringify(formData.songIds ?? []));
  fd.set("collaboratorIds", JSON.stringify(formData.collaboratorIds ?? []));

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
}: PlaylistRequestData): Promise<void> {
  const fd = new FormData();
  if (formData.name) fd.set("name", formData.name);
  if (formData.description != null) fd.set("description", formData.description);
  if (typeof formData.isPrivate === "boolean") {
    fd.set("isPrivate", String(!!formData.isPrivate));
  }
  if (formData.image) fd.set("image", formData.image as File);

  fd.set("songIds", JSON.stringify(formData.songIds ?? []));
  fd.set("collaboratorIds", JSON.stringify(formData.collaboratorIds ?? []));

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
