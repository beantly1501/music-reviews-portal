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
  AlbumCreateForm,
  albumCreateSchema,
  AlbumRequestData,
  truncate,
} from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

import { useGetArtists } from "../artists/hooks/useGetArtists.ts";
import CreateLimitedArtistDialog from "../../shared/components/CreateLimitedArtistDialog.tsx";
import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog.tsx";
import ArtistMultiSelect, {
  ArtistOption,
} from "../../shared/components/ArtistMultiSelect.tsx";
import SongMultiSelect, {
  SongOption,
} from "../../shared/components/SongMultiSelect.tsx";
import { useGetSongs } from "../songs/hooks/useGetSongs.tsx";
import { createAlbum, updateAlbum } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingAlbumData?: AlbumRequestData;
}

const EMPTY_FORM: AlbumCreateForm = {
  name: "",
  link: "",
  year: undefined as unknown as number,
  cover: undefined,
  songIds: [],
  artistIds: [],
};

export default function CreateAlbumDialog({
  visible,
  setVisible,
  onCreated,
  existingAlbumData,
}: Props) {
  const {
    artists,
    loading: artistsLoading,
    refetch: refetchArtists,
  } = useGetArtists();
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();

  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [songDialogVisible, setSongDialogVisible] = useState(false);

  const coverUploadRef = useRef<FileUpload>(null);
  const [coverName, setCoverName] = useState<string>("Choose");

  const handleArtistCreated = useCallback(() => {
    refetchArtists?.();
    setArtistDialogVisible(false);
  }, [refetchArtists]);

  const handleSongCreated = useCallback(() => {
    refetchSongs?.();
    setSongDialogVisible(false);
  }, [refetchSongs]);

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
    defaultValues: EMPTY_FORM,
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    const nextDefaults: AlbumCreateForm = existingAlbumData
      ? {
          name: existingAlbumData.formData.name ?? "",
          link: existingAlbumData.formData.link ?? "",
          year: existingAlbumData.formData.year as number,
          cover: undefined,
          songIds: existingAlbumData.formData.songIds ?? [],
          artistIds: existingAlbumData.formData.artistIds ?? [],
        }
      : EMPTY_FORM;

    reset(nextDefaults);
    setCoverName(
      existingAlbumData?.formData.cover ? "Change Existing" : "Choose",
    );
  }, [existingAlbumData, visible, reset]);

  const onSubmit: SubmitHandler<AlbumCreateForm> = useCallback(
    async (data) => {
      const normalized: AlbumCreateForm = {
        ...data,
        songIds: Array.isArray(data.songIds) ? data.songIds : [],
        artistIds: Array.isArray(data.artistIds) ? data.artistIds : [],
      };

      if (existingAlbumData?.albumId) {
        await updateAlbum({
          albumId: existingAlbumData.albumId,
          formData: normalized,
        });
      } else {
        await createAlbum({ formData: normalized });
      }

      reset(EMPTY_FORM);
      onCreated();
      setVisible(false);
    },
    [existingAlbumData, onCreated, reset, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() =>
        existingAlbumData ? <div>Edit Album</div> : <div>Add an Album</div>
      }
      onHide={() => {
        reset(EMPTY_FORM);
        setVisible(false);
      }}
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
              render={({ field }) => (
                <InputText
                  id="name"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
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
                    ref={coverUploadRef}
                    name={field.name}
                    mode="basic"
                    customUpload
                    accept="image/*"
                    maxFileSize={5_000_000}
                    chooseLabel={coverName}
                    chooseOptions={{
                      icon: existingAlbumData ? "pi pi-sync" : "pi pi-plus",
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

            {/* LINK */}
            <div className="field">
              <label htmlFor="link">Link to Album</label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="link"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
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
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(
                      v === "" ? (undefined as unknown as number) : Number(v),
                    );
                  }}
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
            <Controller
              name="songIds"
              control={control}
              render={({ field }) => (
                <SongMultiSelect
                  value={field.value ?? []}
                  options={songOptions}
                  loading={songsLoading}
                  onChange={(ids) => field.onChange(ids)}
                  onCreateNew={() => setSongDialogVisible(true)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </div>

          {/* ARTISTS MULTISELECT */}
          <div className="field">
            <label htmlFor="artistIdsSelect">Artists (optional)</label>
            <Controller
              name="artistIds"
              control={control}
              render={({ field }) => (
                <ArtistMultiSelect
                  value={field.value ?? []}
                  options={artistOptions}
                  loading={artistsLoading}
                  onChange={(ids) => field.onChange(ids)}
                  onCreateNew={() => setArtistDialogVisible(true)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </div>

          <Button
            type="submit"
            label="Submit"
            className="mt-3"
            loading={isSubmitting}
          />
        </form>
      </FormProvider>

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
