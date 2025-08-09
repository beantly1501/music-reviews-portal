// src/features/albums/CreateAlbumDialog.tsx

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
  AlbumCreateForm,
  albumCreateSchema,
  getToken,
  parseIdList,
} from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

// hooks to fetch selectable options
import { useGetArtists } from "../artists/hooks/useGetArtists.ts";

// optional “limited create” dialogs (mirror of CreateSongDialog pattern)
import CreateLimitedArtistDialog from "../../shared/components/CreateLimitedArtistDialog.tsx";
import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog.tsx";
import ArtistMultiSelect, {
  ArtistOption,
} from "../../shared/components/ArtistMultiSelect.tsx";
import SongMultiSelect, {
  SongOption,
} from "../../shared/components/SongMultiSelect.tsx";
import { useGetSongs } from "../songs/hooks/useGetSongs.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
}

export default function CreateAlbumDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  // fetch artists & songs
  const {
    artists,
    loading: artistsLoading,
    refetch: refetchArtists,
  } = useGetArtists();

  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();

  // selected ids managed locally; kept in sync with hidden inputs
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);

  // create dialog visibility
  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [songDialogVisible, setSongDialogVisible] = useState(false);

  // keep hidden inputs (backward-compat with existing submit logic)
  useEffect(() => {
    const el = document.getElementById("artistIds") as HTMLInputElement | null;
    if (el) el.value = selectedArtistIds.join(",");
  }, [selectedArtistIds]);

  useEffect(() => {
    const el = document.getElementById("songIds") as HTMLInputElement | null;
    if (el) el.value = selectedSongIds.join(",");
  }, [selectedSongIds]);

  // after creating inside child dialogs, refetch so new option appears
  const handleArtistCreated = useCallback(() => {
    refetchArtists?.();
    setArtistDialogVisible(false);
  }, [refetchArtists]);

  const handleSongCreated = useCallback(() => {
    refetchSongs?.();
    setSongDialogVisible(false);
  }, [refetchSongs]);

  // map fetched data into options for the MultiSelects
  const artistOptions: ArtistOption[] = useMemo(
    () => (artists as ArtistOption[]) ?? [],
    [artists],
  );

  const songOptions: SongOption[] = useMemo(
    () =>
      (songs as SongOption[])?.map((s) => ({
        id: s.id,
        name: s.name,
        year: s.year,
      })) ?? [],
    [songs],
  );

  const methods = useForm<AlbumCreateForm>({
    resolver: zodResolver(albumCreateSchema),
    defaultValues: {
      name: "",
      link: "",
      year: undefined,
      cover: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<AlbumCreateForm> = useCallback(
    async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.link) formData.append("link", data.link);
      if (data.year !== undefined && data.year !== null) {
        formData.append("year", String(data.year));
      }
      if (data.cover) {
        formData.append("cover", data.cover);
      }

      // collect raw ids from hidden inputs (kept for API compatibility)
      const songIdsInput = (
        document.getElementById("songIds") as HTMLInputElement
      )?.value;
      const artistIdsInput = (
        document.getElementById("artistIds") as HTMLInputElement
      )?.value;
      const songIds = parseIdList(songIdsInput);
      const artistIds = parseIdList(artistIdsInput);

      if (songIds.length > 0) {
        formData.append("songIds", JSON.stringify(songIds));
      }
      if (artistIds.length > 0) {
        formData.append("artistIds", JSON.stringify(artistIds));
      }

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/album/create", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create album failed: ${res.status} ${text}`);
      }

      onCreated();
      setVisible(false);
    },
    [onCreated, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() => <div>Add an Album</div>}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          {/* ALBUM NAME */}
          <div className="field">
            <label htmlFor="name">Album Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <InputText id="name" {...field} />}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          <div className="flex justify-content-around gap-3">
            {/* COVER IMAGE */}
            <div className="field">
              <label htmlFor="cover">Cover Image</label>
              <Controller
                name="cover"
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
              {errors.cover && (
                <small className="p-error">{errors.cover.message}</small>
              )}
            </div>

            {/* LINK */}
            <div className="field">
              <label htmlFor="link">Link to Album</label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => <InputText id="link" {...field} />}
              />
              {errors.link && (
                <small className="p-error">{errors.link.message}</small>
              )}
            </div>
          </div>

          {/* YEAR */}
          <div className="field">
            <label htmlFor="year">Year</label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <InputText
                  id="year"
                  type="number"
                  value={field.value !== undefined ? String(field.value) : ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
            {errors.year && (
              <small className="p-error">{errors.year.message}</small>
            )}
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

          {/* ARTISTS MULTISELECT */}
          <div className="field">
            <label htmlFor="artistIdsSelect">Artists (optional)</label>
            <ArtistMultiSelect
              value={selectedArtistIds}
              options={artistOptions}
              loading={artistsLoading}
              onChange={setSelectedArtistIds}
              onCreateNew={() => setArtistDialogVisible(true)}
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
            />
          </div>

          {/* HIDDEN INPUTS kept for existing onSubmit logic (do not remove) */}
          <input type="hidden" id="songIds" />
          <input type="hidden" id="artistIds" />

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>

      {/* CREATE DIALOGS OVER THE TOP */}
      <CreateLimitedSongDialog
        visible={songDialogVisible}
        setVisible={setSongDialogVisible}
        onCreated={handleSongCreated}
      />
      <CreateLimitedArtistDialog
        visible={artistDialogVisible}
        setVisible={setArtistDialogVisible}
        onCreated={handleArtistCreated}
      />
    </Dialog>
  );
}
