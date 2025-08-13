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

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";

import {
  parseIdList,
  PlaylistCreateForm,
  playlistCreateSchema,
  PlaylistRequestData,
  truncate,
  UserOption,
} from "@shared/utils";

import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog";
import { useGetSongs } from "../songs/hooks/useGetSongs.tsx";
import SongMultiSelect, {
  SongOption,
} from "../../shared/components/SongMultiSelect.tsx";
import { useGetUsernames } from "../../shared/hooks/useGetUsers.ts";
import UserMultiSelect from "../../shared/components/UserMultiSelect.tsx";
import { createPlaylist, updatePlaylist } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingPlaylistData?: PlaylistRequestData;
}

export default function CreatePlaylistDialog({
  visible,
  setVisible,
  onCreated,
  existingPlaylistData,
}: Props) {
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();
  const { users, loading: usersLoading } = useGetUsernames();

  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<
    number[]
  >([]);
  const [songDialogVisible, setSongDialogVisible] = useState(false);

  const coverUploadRef = useRef<FileUpload>(null);
  const [coverName, setCoverName] = useState<string>("Choose image");

  const songOptions: SongOption[] = useMemo(
    () =>
      (songs as SongOption[])?.map((s) => ({
        id: s.id,
        name: s.name,
        year: s.year,
      })) ?? [],
    [songs],
  );

  const collaboratorOptions: UserOption[] = useMemo(
    () => (users as UserOption[]) ?? [],
    [users],
  );

  const methods = useForm<PlaylistCreateForm>({
    resolver: zodResolver(playlistCreateSchema),
    defaultValues: existingPlaylistData?.formData ?? {
      name: "",
      image: null,
      description: "",
      isPrivate: false,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    const el = document.getElementById("songIds") as HTMLInputElement | null;
    if (el) el.value = selectedSongIds.join(",");
  }, [selectedSongIds]);

  useEffect(() => {
    const el = document.getElementById(
      "collaboratorIds",
    ) as HTMLInputElement | null;
    if (el) el.value = selectedCollaboratorIds.join(",");
  }, [selectedCollaboratorIds]);

  const onSubmit: SubmitHandler<PlaylistCreateForm> = useCallback(
    async (data) => {
      const songIdsInput = (
        document.getElementById("songIds") as HTMLInputElement | null
      )?.value;
      const collaboratorIdsInput = (
        document.getElementById("collaboratorIds") as HTMLInputElement | null
      )?.value;

      const songIds = parseIdList(songIdsInput);
      const collaboratorIds = parseIdList(collaboratorIdsInput);

      if (existingPlaylistData) {
        await updatePlaylist({
          playlistId: existingPlaylistData.playlistId,
          formData: data,
          songIds,
          collaboratorIds,
        });
      } else {
        await createPlaylist({
          formData: data,
          songIds,
          collaboratorIds,
        });
      }

      onCreated?.();
      setVisible(false);
    },
    [onCreated, setVisible, existingPlaylistData],
  );

  useEffect(() => {
    setSelectedSongIds(existingPlaylistData?.songIds ?? []);
    setSelectedCollaboratorIds(existingPlaylistData?.collaboratorIds ?? []);
    setCoverName(
      existingPlaylistData?.formData.image ? `Change Existing` : "Choose",
    );
  }, [existingPlaylistData]);

  return (
    <Dialog
      visible={visible}
      header={
        existingPlaylistData ? (
          <div>Edit playlist</div>
        ) : (
          <div>Create a playlist</div>
        )
      }
      onHide={() => {
        reset();
        setVisible(false);
      }}
      resizable={false}
      draggable={false}
      className="w-30rem"
      breakpoints={{ "960px": "40vw", "640px": "95vw" }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <InputText id="name" {...field} />}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="image">Cover Image</label>
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
                    icon: existingPlaylistData?.formData.image
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

          <div className="field">
            <label htmlFor="description">Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="description"
                  rows={3}
                  autoResize
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
            {errors.description && (
              <small className="p-error">{errors.description.message}</small>
            )}
          </div>

          <div className="field flex align-items-center gap-2">
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <>
                  <InputSwitch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.value)}
                  />
                  <label htmlFor="isPrivate" className="m-0">
                    Private
                  </label>
                </>
              )}
            />
          </div>

          <div className="field">
            <label htmlFor="songIdsSelect">Songs</label>
            <SongMultiSelect
              id="songIdsSelect"
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

          <div className="field">
            <label htmlFor="collaboratorIdsSelect">
              Collaborators (Optional)
            </label>
            <UserMultiSelect
              id="collaboratorIdsSelect"
              value={selectedCollaboratorIds}
              options={collaboratorOptions}
              loading={usersLoading}
              onChange={setSelectedCollaboratorIds}
              appendTo={
                typeof document !== "undefined" ? document.body : undefined
              }
              className="w-full"
              placeholder="Choose collaborators"
            />
          </div>

          {/* HIDDEN INPUTS kept for existing onSubmit logic */}
          <input type="hidden" id="songIds" />
          <input type="hidden" id="collaboratorIds" />

          <div className="flex justify-content-end gap-2 mt-3">
            <Button type="submit" label="Create" loading={isSubmitting} />
          </div>
        </form>
      </FormProvider>

      <CreateLimitedSongDialog
        visible={songDialogVisible}
        setVisible={setSongDialogVisible}
        onCreated={() => {
          setSongDialogVisible(false);
          refetchSongs?.();
        }}
      />
    </Dialog>
  );
}
