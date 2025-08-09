import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseIdList, SongCreateForm, songCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { useGetGenres } from "../../shared/hooks/useGetGenres.ts";
import { useGetArtists } from "../artists/hooks/useGetArtists.ts";
import { useGetAlbums } from "../albums/hooks/useGetAlbums.ts";
import CreateLimitedAlbumDialog from "../../shared/components/CreateLimitedAlbumDialog.tsx";
import CreateLimitedArtistDialog from "../../shared/components/CreateLimitedArtistDialog.tsx";
import AlbumMultiSelect, {
  AlbumOption,
} from "../../shared/components/AlbumMultiSelect.tsx";
import ArtistMultiSelect, {
  ArtistOption,
} from "../../shared/components/ArtistMultiSelect.tsx";
import GenresMultiSelect, {
  GenreOption,
} from "../../shared/components/GenresMultiSelect.tsx";
import CreateGenreDialog from "../../shared/components/CreateGenreDialog.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
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

  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);

  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);
  const [genreDialogVisible, setGenreDialogVisible] = useState(false);

  // hidden inputs sync (for existing submit logic)
  useEffect(() => {
    const el = document.getElementById("artistIds") as HTMLInputElement | null;
    if (el) el.value = selectedArtistIds.join(",");
  }, [selectedArtistIds]);

  useEffect(() => {
    const el = document.getElementById("albumIds") as HTMLInputElement | null;
    if (el) el.value = selectedAlbumIds.join(",");
  }, [selectedAlbumIds]);

  // on created inside child dialogs, refetch lists so new option appears
  const handleArtistCreated = useCallback(() => {
    refetchArtists?.();
    setArtistDialogVisible(false);
  }, [refetchArtists]);

  const handleAlbumCreated = useCallback(() => {
    refetchAlbums?.();
    setAlbumDialogVisible(false);
  }, [refetchAlbums]);

  const handleGenreCreated = useCallback(() => {
    refetchGenres?.();
    setGenreDialogVisible(false);
  }, [refetchGenres]);

  // map fetched data for MultiSelects
  const artistOptions: ArtistOption[] = useMemo(
    () => (artists as ArtistOption[]) ?? [],
    [artists],
  );

  const albumOptions: AlbumOption[] = useMemo(
    () => (albums as AlbumOption[]) ?? [],
    [albums],
  );

  const genreOptions: GenreOption[] = useMemo(
    () =>
      (genres ?? []).map((g) => ({ id: g.id, name: g.name })) as GenreOption[],
    [genres],
  );

  const methods = useForm<SongCreateForm>({
    resolver: zodResolver(songCreateSchema),
    defaultValues: {
      name: "",
      link: "",
      year: undefined,
      file: undefined,
      cover: undefined,
      genreIds: [],
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (visible) {
      refetchGenres?.();
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

      // raw values from hidden inputs
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement
      )?.value;
      const artistIdsInput = (
        document.getElementById("artistIds") as HTMLInputElement
      )?.value;

      const albumIds = parseIdList(albumIdsInput);
      const artistIds = parseIdList(artistIdsInput);

      if (albumIds.length > 0) {
        formData.append("albumIds", JSON.stringify(albumIds));
      }
      if (artistIds.length > 0) {
        formData.append("artistIds", JSON.stringify(artistIds));
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

          <div className="flex justify-content-around gap-3">
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
                    maxFileSize={10_000_000}
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

          {/* GENRES MULTISELECT */}
          <div className="field">
            <label htmlFor="genreIds">Genres (optional)</label>
            <Controller
              name="genreIds"
              control={control}
              render={({ field }) => (
                <GenresMultiSelect
                  id="genreIds"
                  value={(field.value as number[]) ?? []}
                  options={genreOptions}
                  loading={genresLoading}
                  onChange={field.onChange}
                  onCreateNew={() => setGenreDialogVisible(true)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
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
          <input type="hidden" id="albumIds" />
          <input type="hidden" id="artistIds" />

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>

      {/* CREATE DIALOGS */}
      <CreateLimitedAlbumDialog
        visible={albumDialogVisible}
        setVisible={setAlbumDialogVisible}
        onCreated={handleAlbumCreated}
      />
      <CreateLimitedArtistDialog
        visible={artistDialogVisible}
        setVisible={setArtistDialogVisible}
        onCreated={handleArtistCreated}
      />
      <CreateGenreDialog
        visible={genreDialogVisible}
        setVisible={setGenreDialogVisible}
        onCreated={handleGenreCreated}
      />
    </Dialog>
  );
}
