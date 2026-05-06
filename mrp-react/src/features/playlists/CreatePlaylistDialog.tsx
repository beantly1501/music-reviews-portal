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

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";

import {
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
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingPlaylistData?: PlaylistRequestData;
}

const EMPTY_FORM: PlaylistCreateForm = {
  name: "",
  image: null,
  description: "",
  isPrivate: false,
  songIds: [],
  collaboratorIds: [],
};

export default function CreatePlaylistDialog({
  visible,
  setVisible,
  onCreated,
  existingPlaylistData,
}: Props) {
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();
  const { users, loading: usersLoading } = useGetUsernames();
  const { user } = useCurrentUser();

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

  const collaboratorOptions: UserOption[] =
    (users?.filter((u) =>
      existingPlaylistData
        ? u.id !== existingPlaylistData?.ownerId
        : u.id !== user?.id,
    ) as UserOption[]) ?? [];

  const methods = useForm<PlaylistCreateForm>({
    resolver: zodResolver(playlistCreateSchema),
    defaultValues: EMPTY_FORM,
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    const nextDefaults: PlaylistCreateForm = existingPlaylistData
      ? {
          name: existingPlaylistData.formData.name ?? "",
          image: null,
          description: existingPlaylistData.formData.description ?? "",
          isPrivate: existingPlaylistData.formData.isPrivate,
          songIds: existingPlaylistData.formData.songIds ?? [],
          collaboratorIds: existingPlaylistData.formData.collaboratorIds ?? [],
        }
      : EMPTY_FORM;

    reset(nextDefaults);
    setCoverName(
      existingPlaylistData?.formData.image ? "Change Existing" : "Choose image",
    );
  }, [existingPlaylistData, visible, reset]);

  const onSubmit: SubmitHandler<PlaylistCreateForm> = useCallback(
    async (data) => {
      const normalized: PlaylistCreateForm = {
        ...data,
        songIds: data.songIds ?? [],
        collaboratorIds: data.collaboratorIds ?? [],
      };

      try {
        if (existingPlaylistData) {
          await updatePlaylist({
            playlistId: existingPlaylistData.playlistId,
            ownerId: existingPlaylistData.ownerId,
            formData: normalized,
          });
          toast.success("Playlist updated.");
        } else {
          await createPlaylist({
            formData: normalized,
          });
          toast.success("Playlist created.");
        }
        onCreated?.();
        setVisible(false);
      } catch {
        toast.error(
          existingPlaylistData
            ? "Failed to update playlist."
            : "Failed to create playlist.",
        );
      }
    },
    [onCreated, setVisible, existingPlaylistData],
  );

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
        reset(EMPTY_FORM); // clear on close
        setVisible(false);
      }}
      resizable={false}
      draggable={false}
      className="md:w-[650px] w-[400px]"
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-fluid flex flex-col gap-2"
        >
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

          <div className="field flex items-center gap-2">
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <>
                  <InputSwitch
                    checked={!!field.value}
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
            <Controller
              name="songIds"
              control={control}
              render={({ field }) => (
                <SongMultiSelect
                  id="songIdsSelect"
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

          <div className="field">
            <label htmlFor="collaboratorIdsSelect">
              Collaborators (Optional)
            </label>
            <Controller
              name="collaboratorIds"
              control={control}
              render={({ field }) => (
                <UserMultiSelect
                  id="collaboratorIdsSelect"
                  value={field.value ?? []}
                  options={collaboratorOptions}
                  loading={usersLoading}
                  onChange={(ids) => field.onChange(ids)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                  placeholder="Choose collaborators"
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 mt-3">
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
