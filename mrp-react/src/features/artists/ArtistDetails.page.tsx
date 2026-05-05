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

import { useGetImage } from "../../shared/hooks/useGetImage.ts";
import { AlbumType, SongType, UserRoleEnum } from "@shared/utils";
import { useGetArtist } from "./hooks/useGetArtist.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { toast } from "../../shared/components/ToastContext.tsx";
import CreateArtistDialog from "./CreateArtistDialog.tsx";
import { deleteArtist } from "./utils/helpers.tsx";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ArtistDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const artistId = useMemo(() => (id ? Number(id) : undefined), [id]);
  const { user } = useCurrentUser();
  const {
    artist,
    loading: loadingArtist,
    error: artistError,
    refetch: artistRefetch,
  } = useGetArtist(artistId);
  const {
    loading: loadingImage,
    exists: imageExists,
    image: imageSrc,
    imageAsJsFile,
    refetch: refetchImage,
  } = useGetImage(
    artistId ? `${VITE_BACKEND_URL}/images/artist/${artistId}` : undefined,
  );

  const [editArtistDialogVisible, setEditArtistDialogVisible] =
    useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = () => {
    confirmDialog({
      header: "Confirm Delete",
      message: "Delete this artist permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          setDeleting(true);
          await deleteArtist(artist?.id ?? -1).then(() => navigate("/artists"));
          toast.success("Artist deleted.");
        } catch {
          toast.error("Failed to delete artist.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleRefetch = () => {
    refetchImage?.();
    artistRefetch?.();
  };

  if (!artistId) {
    return <Message severity="error" text="Invalid artist id." />;
  }

  if (loadingArtist) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-3 flex-col">
        <ProgressSpinner />
        <div className="text-[#6b7280] text-[0.95rem]">Loading artist…</div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <Message severity="error" text={artistError ?? "Artist not found."} />
    );
  }

  const canModify = !!user && user.role === UserRoleEnum.ADMIN;

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
            <div className="flex gap-3">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => setEditArtistDialogVisible(true)}
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
            </div>
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

          <div className="flex-1">
            <div className="text-2xl font-semibold mb-2">{artist.name}</div>

            {artist.description ? (
              <div className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
                {artist.description}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="m-0">Songs this artist appears on</h2>
        </div>

        <DataTable
          value={artist.songs ?? []}
          rowHover
          stripedRows
          removableSort
          paginator
          rows={10}
          onRowClick={(row) => navigate(`/song/${row.data.id}`)}
          emptyMessage="No songs for this artist."
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

      <Divider />

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="m-0">Albums this artist appears on</h2>
        </div>

        <DataTable
          value={artist.albums ?? []}
          rowHover
          stripedRows
          removableSort
          paginator
          rows={10}
          onRowClick={(row) => navigate(`/album/${row.data.id}`)}
          emptyMessage="No albums for this artist."
        >
          <Column field="name" header="Name" sortable />
          <Column
            field="year"
            header="Year"
            body={(row: AlbumType) => row.year ?? "-"}
            sortable
          />
        </DataTable>
      </Card>

      {editArtistDialogVisible && (
        <CreateArtistDialog
          visible={editArtistDialogVisible}
          setVisible={setEditArtistDialogVisible}
          onCreated={handleRefetch}
          existingArtistData={{
            artistId,
            formData: {
              name: artist.name,
              image: imageExists ? imageAsJsFile! : undefined,
              description: artist.description,
              songIds: artist.songs?.map((s) => s.id) ?? [],
              albumIds: artist.albums?.map((a) => a.id) ?? [],
            },
          }}
        />
      )}

      <ConfirmDialog />
    </div>
  );
}
