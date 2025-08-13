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
  ArtistCreateForm,
  artistCreateSchema,
  ArtistRequestData,
  parseIdList,
  truncate,
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
import { createArtist, updateArtist } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingArtistData?: ArtistRequestData;
}

export default function CreateArtistDialog({
  visible,
  setVisible,
  onCreated,
  existingArtistData,
}: Props) {
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();
  const {
    albums,
    loading: albumsLoading,
    refetch: refetchAlbums,
  } = useGetAlbums();

  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);

  const [songDialogVisible, setSongDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  const coverUploadRef = useRef<FileUpload>(null);
  const [coverName, setCoverName] = useState<string>("");

  useEffect(() => {
    const el = document.getElementById("songIds") as HTMLInputElement | null;
    if (el) el.value = selectedSongIds.join(",");
  }, [selectedSongIds]);

  useEffect(() => {
    const el = document.getElementById("albumIds") as HTMLInputElement | null;
    if (el) el.value = selectedAlbumIds.join(",");
  }, [selectedAlbumIds]);

  const handleSongCreated = useCallback(() => {
    refetchSongs?.();
    setSongDialogVisible(false);
  }, [refetchSongs]);

  const handleAlbumCreated = useCallback(() => {
    refetchAlbums?.();
    setAlbumDialogVisible(false);
  }, [refetchAlbums]);

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
    defaultValues: existingArtistData?.formData ?? {
      name: "",
      description: "",
      image: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<ArtistCreateForm> = useCallback(
    async (data) => {
      const songIdsInput = (
        document.getElementById("songIds") as HTMLInputElement | null
      )?.value;
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement | null
      )?.value;

      const songIds = parseIdList(songIdsInput);
      const albumIds = parseIdList(albumIdsInput);

      if (existingArtistData) {
        await updateArtist({
          artistId: existingArtistData.artistId,
          formData: data,
          songIds,
          albumIds,
        });
      } else {
        await createArtist({
          formData: data,
          songIds,
          albumIds,
        });
      }

      onCreated();
      setVisible(false);
    },
    [onCreated, setVisible, existingArtistData],
  );

  useEffect(() => {
    setSelectedSongIds(existingArtistData?.songIds ?? []);
    setSelectedAlbumIds(existingArtistData?.albumIds ?? []);
    setCoverName(
      existingArtistData?.formData.image ? `Change Existing` : "Choose",
    );
  }, [existingArtistData]);

  return (
    <Dialog
      visible={visible}
      header={() =>
        existingArtistData ? <div>Edit Artist</div> : <div>Add an Artist</div>
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
                  ref={coverUploadRef}
                  name={field.name}
                  mode="basic"
                  customUpload
                  accept="image/*"
                  maxFileSize={5_000_000}
                  chooseLabel={coverName}
                  chooseOptions={{
                    icon: existingArtistData?.formData.image
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
