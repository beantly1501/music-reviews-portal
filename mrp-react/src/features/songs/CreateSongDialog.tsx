import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "../../shared/components/ToastContext.tsx";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SongCreateForm,
  songCreateSchema,
  SongRequestData,
  truncate,
} from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { useGetArtists } from "../artists/hooks/useGetArtists.ts";
import CreateLimitedAlbumDialog from "../../shared/components/CreateLimitedAlbumDialog.tsx";
import CreateLimitedArtistDialog from "../../shared/components/CreateLimitedArtistDialog.tsx";
import AlbumMultiSelect from "../../shared/components/AlbumMultiSelect.tsx";
import ArtistMultiSelect, {
  ArtistOption,
} from "../../shared/components/ArtistMultiSelect.tsx";
import GenresMultiSelect from "../../shared/components/GenresMultiSelect.tsx";
import { createSong, updateSong } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingSongData?: SongRequestData; // expects arrays in formData
}

const EMPTY_FORM: SongCreateForm = {
  name: "",
  link: undefined,
  year: undefined,
  file: undefined,
  cover: undefined,
  albumIds: [],
  artistIds: [],
  genreIds: [],
};

export default function CreateSongDialog({
  visible,
  setVisible,
  onCreated,
  existingSongData,
}: Props) {
  const {
    artists,
    loading: artistsLoading,
    refetch: refetchArtists,
  } = useGetArtists();

  const [artistDialogVisible, setArtistDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  const audioUploadRef = useRef<FileUpload>(null);
  const coverUploadRef = useRef<FileUpload>(null);
  const [audioName, setAudioName] = useState<string>("Choose");
  const [coverName, setCoverName] = useState<string>("Choose");

  const handleArtistCreated = useCallback(() => {
    refetchArtists?.();
    setArtistDialogVisible(false);
  }, [refetchArtists]);

  const handleAlbumCreated = useCallback(() => {
    setAlbumDialogVisible(false);
  }, []);

  const artistOptions: ArtistOption[] = useMemo(
    () => (artists as ArtistOption[]) ?? [],
    [artists],
  );

  const methods = useForm<SongCreateForm>({
    resolver: zodResolver(songCreateSchema),
    defaultValues: EMPTY_FORM,
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    const nextDefaults: SongCreateForm = existingSongData
      ? {
          name: existingSongData.formData.name ?? "",
          link: existingSongData.formData.link ?? undefined,
          year: existingSongData.formData.year ?? undefined,
          file: undefined,
          cover: undefined,
          albumIds: existingSongData.formData.albumIds ?? [],
          artistIds: existingSongData.formData.artistIds ?? [],
          genreIds: existingSongData.formData.genreIds ?? [],
        }
      : EMPTY_FORM;

    reset(nextDefaults);

    setAudioName(
      existingSongData?.formData.file ? "Change Existing" : "Choose",
    );
    setCoverName(
      existingSongData?.formData.cover ? "Change Existing" : "Choose",
    );
  }, [existingSongData, visible, reset]);

  const onSubmit: SubmitHandler<SongCreateForm> = useCallback(
    async (data) => {
      try {
        if (existingSongData?.songId) {
          await updateSong({
            songId: existingSongData.songId,
            formData: data,
          });
          toast.success("Song updated.");
        } else {
          await createSong({ formData: data });
          toast.success("Song created.");
        }
        reset(EMPTY_FORM);
        onCreated();
        setVisible(false);
      } catch {
        toast.error(
          existingSongData?.songId
            ? "Failed to update song."
            : "Failed to create song.",
        );
      }
    },
    [existingSongData, onCreated, reset, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() =>
        existingSongData ? <div>Edit Song</div> : <div>Add a Song</div>
      }
      onHide={() => {
        reset(EMPTY_FORM);
        setVisible(false);
      }}
      resizable={false}
      draggable={false}
      className="md:w-[650px] w-[400px]"
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-fluid flex flex-col gap-1"
        >
          <div className="field">
            <label htmlFor="name">Song Name</label>
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

          <div className="flex justify-around gap-3">
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
                      icon: existingSongData ? "pi pi-sync" : "pi pi-plus",
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
                      icon: existingSongData ? "pi pi-sync" : "pi pi-plus",
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

          <div className="field">
            <label htmlFor="link">Link to song</label>
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
                    field.onChange(v === "" ? undefined : Number(v));
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

          <div className="field">
            <label htmlFor="genreIdsSelect">Genres (optional)</label>
            <Controller
              name="genreIds"
              control={control}
              render={({ field }) => (
                <GenresMultiSelect
                  value={field.value ?? []}
                  onChange={(ids) => field.onChange(ids)}
                  allowCreate
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="field">
            <label htmlFor="albumIdsSelect">Albums (optional)</label>
            <Controller
              name="albumIds"
              control={control}
              render={({ field }) => (
                <AlbumMultiSelect
                  value={field.value ?? []}
                  onChange={(ids) => field.onChange(ids)}
                  onCreateNew={() => setAlbumDialogVisible(true)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="field mb-3">
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

          <Button type="submit" label="Submit" loading={isSubmitting} />
        </form>
      </FormProvider>

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
    </Dialog>
  );
}
