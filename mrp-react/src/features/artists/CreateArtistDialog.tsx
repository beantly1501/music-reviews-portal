// src/features/artists/CreateArtistDialog.tsx
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArtistCreateForm,
  artistCreateSchema,
  getToken,
  parseIdList,
} from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

import { useGetSongs } from "../songs/hooks/useGetSongs.tsx";
import { useGetAlbums } from "../albums/hooks/useGetAlbums.ts";

import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog.tsx";
import CreateLimitedAlbumDialog from "../../shared/components/CreateLimitedAlbumDialog.tsx";

import SongMultiSelect, {
  SongOption,
} from "../../shared/components/SongMultiSelect.tsx";
import AlbumMultiSelect, {
  AlbumOption,
} from "../../shared/components/AlbumMultiSelect.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
}

export default function CreateArtistDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();
  const {
    albums,
    loading: albumsLoading,
    refetch: refetchAlbums,
  } = useGetAlbums();

  // Local selection state
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);

  // Quick-create dialog visibility
  const [songDialogVisible, setSongDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  // Hidden inputs sync (kept for existing submit logic)
  useEffect(() => {
    const el = document.getElementById("songIds") as HTMLInputElement | null;
    if (el) el.value = selectedSongIds.join(",");
  }, [selectedSongIds]);

  useEffect(() => {
    const el = document.getElementById("albumIds") as HTMLInputElement | null;
    if (el) el.value = selectedAlbumIds.join(",");
  }, [selectedAlbumIds]);

  // When the dialog opens, you may refresh lists (optional)
  useEffect(() => {
    if (visible) {
      refetchSongs?.();
      refetchAlbums?.();
    }
  }, [visible, refetchSongs, refetchAlbums]);

  // After creating inside child dialogs, refetch so new option appears
  const handleSongCreated = useCallback(() => {
    refetchSongs?.();
    setSongDialogVisible(false);
  }, [refetchSongs]);

  const handleAlbumCreated = useCallback(() => {
    refetchAlbums?.();
    setAlbumDialogVisible(false);
  }, [refetchAlbums]);

  // Map fetched data into options for MultiSelects
  const songOptions: SongOption[] = useMemo(
    () =>
      (songs ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        year: s.year,
      })) as SongOption[],
    [songs],
  );

  const albumOptions: AlbumOption[] = useMemo(
    () => (albums as AlbumOption[]) ?? [],
    [albums],
  );

  // Form
  const methods = useForm<ArtistCreateForm>({
    resolver: zodResolver(artistCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<ArtistCreateForm> = useCallback(
    async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      // read raw ids from hidden inputs (kept for API compatibility)
      const songIdsInput = (
        document.getElementById("songIds") as HTMLInputElement
      )?.value;
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement
      )?.value;

      const songIds = parseIdList(songIdsInput);
      const albumIds = parseIdList(albumIdsInput);

      if (songIds.length > 0)
        formData.append("songIds", JSON.stringify(songIds));
      if (albumIds.length > 0)
        formData.append("albumIds", JSON.stringify(albumIds));

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/artist/create", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create artist failed: ${res.status} ${text}`);
      }

      onCreated();
      setVisible(false);
    },
    [onCreated, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() => <div>Add an Artist</div>}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          {/* ARTIST NAME */}
          <div className="field">
            <label htmlFor="name">Artist Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <InputText id="name" {...field} />}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="field">
            <label htmlFor="description">Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  autoResize
                  id="description"
                  rows={4}
                  {...field}
                />
              )}
            />
            {errors.description && (
              <small className="p-error">{errors.description.message}</small>
            )}
          </div>

          {/* IMAGE */}
          <div className="field">
            <label htmlFor="image">Image</label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <FileUpload
                  name={field.name}
                  mode="basic"
                  customUpload
                  accept="image/*"
                  maxFileSize={5_000_000}
                  onSelect={(event: FileUploadSelectEvent) => {
                    if (event.files && event.files.length) {
                      field.onChange(event.files[0]);
                    }
                  }}
                />
              )}
            />
          </div>

          {/* SONGS MULTISELECT */}
          <div className="field">
            <label htmlFor="songIdsSelect">Songs (optional)</label>
            <SongMultiSelect
              value={selectedSongIds}
              options={songOptions}
              loading={songsLoading}
              onChange={setSelectedSongIds}
              onCreateNew={() => setSongDialogVisible(true)}
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
            />
          </div>

          {/* ALBUMS MULTISELECT */}
          <div className="field">
            <label htmlFor="albumIdsSelect">Albums (optional)</label>
            <AlbumMultiSelect
              value={selectedAlbumIds}
              options={albumOptions}
              loading={albumsLoading}
              onChange={setSelectedAlbumIds}
              onCreateNew={() => setAlbumDialogVisible(true)}
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
            />
          </div>

          {/* HIDDEN INPUTS kept for existing onSubmit logic (do not remove) */}
          <input type="hidden" id="songIds" />
          <input type="hidden" id="albumIds" />

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>

      {/* CREATE DIALOGS */}
      <CreateLimitedSongDialog
        visible={songDialogVisible}
        setVisible={setSongDialogVisible}
        onCreated={handleSongCreated}
      />
      <CreateLimitedAlbumDialog
        visible={albumDialogVisible}
        setVisible={setAlbumDialogVisible}
        onCreated={handleAlbumCreated}
      />
    </Dialog>
  );
}
