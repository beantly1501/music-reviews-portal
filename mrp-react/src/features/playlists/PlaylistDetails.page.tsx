import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import {
  VirtualScroller,
  VirtualScrollerTemplateOptions,
} from "primereact/virtualscroller";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { toast } from "../../shared/components/ToastContext.tsx";

import { SongType, UserOption, UserRoleEnum } from "@shared/utils";
import { useGetPlaylist } from "./hooks/useGetPlaylist.ts";
import { deletePlaylist } from "./utils/helpers.tsx";
import CreatePlaylistDialog from "./CreatePlaylistDialog.tsx";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function PlaylistDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const playlistId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const {
    playlist,
    loading: loadingPlaylist,
    error: playlistError,
    refetch: refetchPlaylist,
  } = useGetPlaylist(playlistId);
  const {
    loading: loadingImage,
    exists: imageExists,
    image: imageSrc,
    imageAsJsFile,
    refetch: refetchImage,
  } = useGetImage(
    playlistId
      ? `${VITE_BACKEND_URL}/images/playlist/${playlistId}`
      : undefined,
  );
  const { user } = useCurrentUser();

  const [editPlaylistDialogVisible, setEditPlaylistDialogVisible] =
    useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const canModify =
    !!user &&
    (user.role === UserRoleEnum.ADMIN || user.id === playlist?.ownerId);

  const handleDelete = () => {
    confirmDialog({
      header: "Confirm Delete",
      message: "Delete this playlist permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          setDeleting(true);
          await deletePlaylist(playlist?.id ?? -1).then(() =>
            navigate("/playlists"),
          );
          toast.success("Playlist deleted.");
        } catch {
          toast.error("Failed to delete playlist.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleRefetch = () => {
    refetchPlaylist?.();
    refetchImage?.();
  };

  if (!playlistId) {
    return <Message severity="error" text="Invalid playlist id." />;
  }

  if (loadingPlaylist) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading playlist…</div>
      </div>
    );
  }

  if (playlistError || !playlist) {
    return (
      <Message severity="error" text={playlistError ?? "Playlist not found."} />
    );
  }

  const collaboratorTemplate = (
    item: UserOption,
    options: VirtualScrollerTemplateOptions,
  ) => {
    const isEven = (options.index ?? 0) % 2 === 0;
    const username = item.username ?? String(item.id);

    return (
      <div
        className="flex items-center justify-between px-3 cursor-pointer"
        style={{
          height: `${options.props.itemSize}px`,
          background: isEven ? "var(--surface-50)" : "transparent",
          transition: "background 0.15s ease",
        }}
        onClick={() => {
          if (user?.id === item.id) {
            navigate(`/profile`);
          } else {
            navigate(`/user/${item.id}`);
          }
        }}
        role="button"
        tabIndex={0}
        title={username}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-100)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = isEven
            ? "var(--surface-50)"
            : "transparent")
        }
      >
        <div className="flex items-center gap-2">
          <i className="pi pi-user" />
          <span
            className="text-gray-900"
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {username}
          </span>
        </div>
        <i className="pi pi-angle-right text-gray-400" />
      </div>
    );
  };

  return (
    <div className="p-3">
      <div className="flex justify-between mb-3">
        <Button
          label="Home"
          icon="pi pi-home"
          onClick={() => navigate("/")}
          severity="secondary"
          outlined
        />
        <div className="flex gap-3">
          {canModify && (
            <>
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => setEditPlaylistDialogVisible(true)}
                severity="info"
                outlined
              />
              <Button
                label="Delete"
                icon={deleting ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                onClick={handleDelete}
                severity="danger"
                outlined
              />
            </>
          )}
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            onClick={() => navigate(-1)}
            severity="secondary"
            outlined
          />
        </div>
      </div>

      <Card className="shadow-md" style={{ overflow: "hidden", borderRadius: 12 }}>
        <div className="flex gap-4 flex-col md:flex-row">
          <div style={{ width: 300, maxWidth: "100%" }}>
            {loadingImage ? (
              <div className="flex items-center justify-center" style={{ height: 280 }}>
                <i className="pi pi-spin pi-spinner" />
              </div>
            ) : (
              <Image
                src={imageExists && imageSrc ? imageSrc : undefined}
                imageStyle={{ width: "100%", height: 280, objectFit: "cover" }}
              />
            )}
          </div>

          <div className="flex-1 flex justify-between gap-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold">{playlist.name}</div>
                <Tag
                  value={playlist.isPrivate ? "Private" : "Public"}
                  severity={playlist.isPrivate ? "danger" : "success"}
                />
              </div>

              <div
                className="text-gray-500 cursor-pointer select-none"
                onClick={() => {
                  if (user?.id === playlist?.ownerId) {
                    navigate("/profile");
                  } else {
                    navigate(`/user/${playlist?.ownerId}`);
                  }
                }}
              >
                Owner: <strong>{playlist.ownerUsername}</strong>
              </div>

              {playlist.description && (
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {playlist.description}
                </div>
              )}
            </div>

            {playlist.collaborators.length > 0 ? (
              <div className="mt-2 w-fit flex flex-col gap-2">
                <div className="mb-1 font-medium">Collaborators</div>
                <VirtualScroller
                  items={playlist.collaborators}
                  itemSize={52}
                  style={{ height: 240, width: 340 }}
                  className="border border-[var(--surface-border)] rounded overflow-hidden shadow-sm bg-[var(--surface-card)]"
                  itemTemplate={collaboratorTemplate}
                />
              </div>
            ) : (
              <div className="text-gray-500">No collaborators.</div>
            )}
          </div>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="m-0">Songs</h2>
          <div className="text-gray-500">
            {playlist.songs?.length ?? 0} total
          </div>
        </div>

        <DataTable
          value={playlist.songs ?? []}
          rowHover
          stripedRows
          removableSort
          paginator
          rows={10}
          onRowClick={(row) => navigate(`/song/${row.data.id}`)}
          emptyMessage="No songs in this playlist."
        >
          <Column field="name" header="Title" sortable />
          <Column
            field="year"
            header="Year"
            body={(row: SongType) => row.year ?? "-"}
            sortable
          />
        </DataTable>
      </Card>

      {editPlaylistDialogVisible && (
        <CreatePlaylistDialog
          visible={editPlaylistDialogVisible}
          setVisible={setEditPlaylistDialogVisible}
          onCreated={handleRefetch}
          existingPlaylistData={{
            playlistId,
            ownerId: playlist.ownerId,
            formData: {
              name: playlist.name,
              image: imageExists ? imageAsJsFile : undefined,
              description: playlist.description,
              isPrivate: playlist.isPrivate,
              songIds: playlist.songs?.map((s) => s.id) ?? [],
              collaboratorIds: playlist.collaborators?.map((c) => c.id) ?? [],
            },
          }}
        />
      )}

      <ConfirmDialog />
    </div>
  );
}
