import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parseIdList,
  SongCreateForm,
  songCreateSchema,
  SongRequestData,
  truncate,
} from "@shared/utils";
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
import { createSong, updateSong } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingSongData?: SongRequestData;
}

export default function CreateSongDialog({
  visible,
  setVisible,
  onCreated,
  existingSongData,
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
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);
  const [genreDialogVisible, setGenreDialogVisible] = useState(false);

  const audioUploadRef = useRef<FileUpload>(null);
  const coverUploadRef = useRef<FileUpload>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [coverName, setCoverName] = useState<string>("");

  // hidden inputs sync (for existing submit logic)
  useEffect(() => {
    const el = document.getElementById("artistIds") as HTMLInputElement | null;
    if (el) el.value = selectedArtistIds.join(",");
  }, [selectedArtistIds]);

  useEffect(() => {
    const el = document.getElementById("albumIds") as HTMLInputElement | null;
    if (el) el.value = selectedAlbumIds.join(",");
  }, [selectedAlbumIds]);

  useEffect(() => {
    const el = document.getElementById("genreIds") as HTMLInputElement | null;
    if (el) el.value = selectedGenreIds.join(",");
  }, [selectedGenreIds]);

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
    () => (genres as GenreOption[]) ?? [],
    [genres],
  );

  const methods = useForm<SongCreateForm>({
    resolver: zodResolver(songCreateSchema),
    // fills everything but multiselects if existing song data exists
    defaultValues: existingSongData?.formData ?? {
      name: "",
      link: "",
      year: undefined,
      file: undefined,
      cover: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<SongCreateForm> = useCallback(
    async (data) => {
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement | null
      )?.value;
      const artistIdsInput = (
        document.getElementById("artistIds") as HTMLInputElement | null
      )?.value;
      const genreIdsInput = (
        document.getElementById("genreIds") as HTMLInputElement | null
      )?.value;

      const albumIds = parseIdList(albumIdsInput);
      const artistIds = parseIdList(artistIdsInput);
      const genreIds = parseIdList(genreIdsInput);

      if (existingSongData) {
        await updateSong({
          songId: existingSongData.songId,
          formData: data,
          albumIds,
          artistIds,
          genreIds,
        });
      } else {
        await createSong({
          formData: data,
          albumIds,
          artistIds,
          genreIds,
        });
      }

      reset();
      onCreated();
      setVisible(false);
    },
    [onCreated, reset, setVisible],
  );

  // fills multiselects and song and cover names if they exist
  useEffect(() => {
    setSelectedGenreIds(existingSongData?.genreIds ?? []);
    setSelectedAlbumIds(existingSongData?.albumIds ?? []);
    setSelectedArtistIds(existingSongData?.artistIds ?? []);
    setAudioName(
      existingSongData?.formData.file ? `Change Existing` : "Choose",
    );
    setCoverName(
      existingSongData?.formData.cover ? `Change Existing` : "Choose",
    );
  }, [existingSongData]);

  return (
    <Dialog
      visible={visible}
      header={() =>
        existingSongData ? <div>Edit Song</div> : <div>Add a Song</div>
      }
      onHide={() => {
        reset();
        setVisible(false);
      }}
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
                    ref={audioUploadRef}
                    name={field.name}
                    mode="basic"
                    multiple={false}
                    customUpload
                    accept="audio/*"
                    maxFileSize={10_000_000}
                    chooseLabel={audioName}
                    chooseOptions={{
                      icon: existingSongData?.formData.file
                        ? "pi pi-sync"
                        : "pi pi-plus",
                    }}
                    onSelect={(event: FileUploadSelectEvent) => {
                      if (event.files && event.files.length) {
                        const f = event.files[0];
                        field.onChange(f);
                        setAudioName(truncate(f.name));
                        audioUploadRef.current?.clear();
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
                    ref={coverUploadRef}
                    name={field.name}
                    mode="basic"
                    customUpload
                    accept="image/*"
                    maxFileSize={5_000_000}
                    chooseLabel={coverName}
                    chooseOptions={{
                      icon: existingSongData?.formData.cover
                        ? "pi pi-sync"
                        : "pi pi-plus",
                    }}
                    onSelect={(event: FileUploadSelectEvent) => {
                      if (event.files && event.files.length) {
                        const f = event.files[0];
                        field.onChange(f);
                        setCoverName(truncate(f.name));
                        coverUploadRef.current?.clear();
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
            <label htmlFor="genreIdsSelect">Genres (optional)</label>
            <GenresMultiSelect
              value={selectedGenreIds}
              options={genreOptions}
              loading={genresLoading}
              onChange={setSelectedGenreIds}
              onCreateNew={() => setGenreDialogVisible(true)}
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
          <input type="hidden" id="genreIds" />

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
