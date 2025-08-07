// src/features/songs/CreateSongDialog.tsx

import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SongCreateForm, songCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { useGetGenres } from "../../shared/hooks/useGetGenres.ts";

/* NEW: hooks for fetching artists/albums */

/* NEW: existing dialogs you already have */
import CreateAlbumDialog from "../../features/albums/CreateAlbumDialog.tsx";
import CreateArtistDialog from "../../features/artists/CreateArtistDialog.tsx";
import { useGetArtists } from "../artists/hooks/useGetArtists.ts";
import { useGetAlbums } from "../albums/hooks/useGetAlbums.ts";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
}

type AlbumMultiselectType = {
  id: number;
  name: string;
  year: number;
};

type ArtistMultiselectType = {
  id: number;
  name: string;
};

function parseIdList(input: string | undefined): number[] {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
}

export default function CreateSongDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const {
    genres,
    loading: genresLoading,
    refetch: refetchGenres,
  } = useGetGenres();
  const genreOptions = genres.map((g) => ({ label: g.name, value: g.id }));

  /* NEW: fetch albums & artists */
  const {
    artists,
    loading: artistsLoading,
    refetch: refetchArtists,
  } = useGetArtists();
  const {
    albums,
    loading: albumsLoading,
    refetch: refetchAlbums,
  } = useGetAlbums();

  /* NEW: multiselect local state (IDs) */
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);

  /* NEW: create dialogs visibility */
  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  /* keep hidden inputs (used by your existing submit logic) in sync */
  useEffect(() => {
    const el = document.getElementById("authorIds") as HTMLInputElement | null;
    if (el) el.value = selectedArtistIds.join(",");
  }, [selectedArtistIds]);

  useEffect(() => {
    const el = document.getElementById("albumIds") as HTMLInputElement | null;
    if (el) el.value = selectedAlbumIds.join(",");
  }, [selectedAlbumIds]);

  /* on created inside child dialogs, refetch lists so new option appears */
  const handleArtistCreated = useCallback(() => {
    refetchArtists?.();
    setArtistDialogVisible(false);
  }, [refetchArtists]);

  const handleAlbumCreated = useCallback(() => {
    refetchAlbums?.();
    setAlbumDialogVisible(false);
  }, [refetchAlbums]);

  /* map fetched data for MultiSelects */
  const artistOptions: ArtistMultiselectType[] = useMemo(
    () => artists as ArtistMultiselectType[],
    [artists],
  );

  const albumOptions: AlbumMultiselectType[] = useMemo(
    () => albums as AlbumMultiselectType[],
    [albums],
  );

  const methods = useForm<SongCreateForm>({
    resolver: zodResolver(songCreateSchema),
    defaultValues: {
      name: "",
      link: "",
      year: undefined,
      file: undefined,
      cover: undefined,
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (visible) {
      refetchGenres();
      refetchArtists?.();
      refetchAlbums?.();
    }
  }, [visible, refetchGenres, refetchArtists, refetchAlbums]);

  const onSubmit: SubmitHandler<SongCreateForm> = useCallback(
    async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.link) formData.append("link", data.link);
      if (data.year !== undefined && data.year !== null)
        formData.append("year", String(data.year));
      if (data.genreIds?.length) {
        formData.append("genreIds", JSON.stringify(data.genreIds));
      }
      if (data.cover) formData.append("cover", data.cover);
      if (data.file) formData.append("file", data.file);

      // grab the raw string values from some extra inputs below
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement
      )?.value;
      const authorIdsInput = (
        document.getElementById("authorIds") as HTMLInputElement
      )?.value;

      const albumIds = parseIdList(albumIdsInput);
      const authorIds = parseIdList(authorIdsInput);

      if (albumIds.length > 0) {
        formData.append("albumIds", JSON.stringify(albumIds));
      }
      if (authorIds.length > 0) {
        formData.append("authorIds", JSON.stringify(authorIds));
      }

      const token = localStorage.getItem("jwt");

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/song/create", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      onCreated();
      setVisible(false);
    },
    [onCreated, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() => <div>Add a song</div>}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          {/* SONG NAME */}
          <div className="field">
            <label htmlFor="name">Song Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <InputText id="name" {...field} />}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          <div className="flex justify-content-around">
            {/* AUDIO FILE */}
            <div className="field">
              <label htmlFor="file">Audio File</label>
              <Controller
                name="file"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    name={field.name}
                    mode="basic"
                    customUpload
                    accept="audio/*"
                    maxFileSize={10000000}
                    onSelect={(event: FileUploadSelectEvent) => {
                      if (event.files && event.files.length) {
                        field.onChange(event.files[0]);
                      }
                    }}
                  />
                )}
              />
              {errors.file && (
                <small className="p-error">{errors.file.message}</small>
              )}
            </div>

            {/* COVER */}
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
          </div>

          {/* LINK */}
          <div className="field">
            <label htmlFor="link">Link to song</label>
            <Controller
              name="link"
              control={control}
              render={({ field }) => <InputText id="link" {...field} />}
            />
            {errors.link && (
              <small className="p-error">{errors.link.message}</small>
            )}
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

          {/* GENRES */}
          <div className="field">
            <label htmlFor="genreIds">Genres (optional)</label>
            <Controller
              name="genreIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  id="genreIds"
                  disabled={genresLoading}
                  value={field.value}
                  options={genreOptions}
                  onChange={(e) => field.onChange(e.value)}
                  filter
                  placeholder="Select genres"
                  display="chip"
                />
              )}
            />
          </div>

          {/* ALBUMS MULTISELECT (uses your existing CreateAlbumDialog) */}
          <div className="field">
            <label htmlFor="albumIdsSelect">Albums (optional)</label>
            <MultiSelect
              id="albumIdsSelect"
              value={selectedAlbumIds}
              options={albumOptions}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => setSelectedAlbumIds(e.value as number[])}
              filter
              filterBy="name,year"
              display="chip"
              placeholder="Select albums"
              loading={albumsLoading}
              itemTemplate={(opt: AlbumMultiselectType) => (
                <div className="flex align-items-center justify-content-between w-full gap-2">
                  <span>{opt.name}</span>
                  <small className="text-500">{opt.year}</small>
                </div>
              )}
              panelHeaderTemplate={() => (
                <div className="flex justify-content-end p-2">
                  <Button
                    label="Create New Album"
                    icon="pi pi-plus"
                    className="p-button-text p-button-sm"
                    onClick={() => setAlbumDialogVisible(true)}
                  />
                </div>
              )}
              /* ensure overlay renders above parent dialog when open */
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
            />
          </div>

          {/* ARTISTS MULTISELECT (uses your existing CreateArtistDialog) */}
          <div className="field">
            <label htmlFor="artistIdsSelect">Artists (optional)</label>
            <MultiSelect
              id="artistIdsSelect"
              value={selectedArtistIds}
              options={artistOptions}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => setSelectedArtistIds(e.value as number[])}
              filter
              filterBy="name"
              display="chip"
              placeholder="Select artists"
              loading={artistsLoading}
              panelHeaderTemplate={() => (
                <div className="flex justify-content-end p-2">
                  <Button
                    label="Create New Artist"
                    icon="pi pi-plus"
                    className="p-button-text p-button-sm"
                    onClick={() => setArtistDialogVisible(true)}
                  />
                </div>
              )}
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
            />
          </div>

          {/* HIDDEN INPUTS kept for existing onSubmit logic (do not remove) */}
          <input type="hidden" id="albumIds" />
          <input type="hidden" id="authorIds" />

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>

      {/* OPEN YOUR EXISTING CREATE DIALOGS OVER THE TOP */}
      <CreateAlbumDialog
        visible={albumDialogVisible}
        setVisible={setAlbumDialogVisible}
        onCreated={handleAlbumCreated}
      />
      <CreateArtistDialog
        visible={artistDialogVisible}
        setVisible={setArtistDialogVisible}
        onCreated={handleArtistCreated}
      />
    </Dialog>
  );
}
