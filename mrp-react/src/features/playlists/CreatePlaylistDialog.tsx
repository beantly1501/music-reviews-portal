import { Dispatch, useCallback, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";

import { getToken, UserOption } from "@shared/utils";
import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog";
import { useGetSongs } from "../songs/hooks/useGetSongs.tsx";
import SongMultiSelect, {
  SongOption,
} from "../../shared/components/SongMultiSelect.tsx";
import { useGetUsernames } from "../../shared/hooks/useGetUsers.ts";
import UserMultiSelect from "../../shared/components/UserMultiSelect.tsx";

type PlaylistCreateForm = {
  name: string;
  image?: File | null; // CHANGED: file instead of string
  description?: string | null;
  isPrivate: boolean;
  songIds: number[];
  collaboratorIds: number[]; // CHANGED: selected IDs from MultiSelect
};

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
}

export default function CreatePlaylistDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const { songs, loading: songsLoading, refetch: refetchSongs } = useGetSongs();
  const { users, loading: usersLoading } = useGetUsernames();

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

  const [songDialogVisible, setSongDialogVisible] = useState(false);

  const methods = useForm<PlaylistCreateForm>({
    defaultValues: {
      name: "",
      image: null,
      description: "",
      isPrivate: false,
      songIds: [],
      collaboratorIds: [],
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = methods;

  const onSubmit: SubmitHandler<PlaylistCreateForm> = useCallback(
    async (data) => {
      const form = new FormData();
      form.append("name", data.name);
      if (data.description != null)
        form.append("description", data.description);
      form.append("isPrivate", String(!!data.isPrivate));
      if (data.songIds?.length)
        form.append("songIds", JSON.stringify(data.songIds));
      if (data.collaboratorIds?.length)
        form.append("collaboratorIds", JSON.stringify(data.collaboratorIds));
      if (data.image) form.append("image", data.image); // let browser set Content-Type + boundary

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/playlists/create`, {
        method: "POST",
        headers,
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      onCreated?.();
      reset();
      setVisible(false);
    },
    [onCreated, reset, setVisible],
  );

  const header = <div>Create a playlist</div>;

  return (
    <Dialog
      visible={visible}
      header={header}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
      className="w-30rem"
      breakpoints={{ "960px": "40vw", "640px": "95vw" }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          {/* NAME */}
          <div className="field">
            <label htmlFor="name">Name</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
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
                  name={field.name}
                  mode="basic"
                  customUpload
                  accept="image/*"
                  maxFileSize={5_000_000}
                  chooseLabel={field.value ? "Replace image" : "Choose image"}
                  onSelect={(event: FileUploadSelectEvent) => {
                    const file = event.files?.[0] ?? null;
                    setValue("image", file);
                  }}
                  onClear={() => setValue("image", null)}
                />
              )}
            />
          </div>

          {/* DESCRIPTION */}
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
          </div>

          {/* PRIVACY */}
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

          {/* SONGS */}
          <div className="field">
            <div className="flex align-items-center justify-content-between mb-2">
              <label htmlFor="songIdsSelect" className="m-0">
                Songs
              </label>
            </div>

            <Controller
              name="songIds"
              control={control}
              render={({ field }) => (
                <SongMultiSelect
                  id="songIdsSelect"
                  value={field.value ?? []}
                  options={songOptions}
                  loading={songsLoading}
                  onChange={field.onChange}
                  onCreateNew={() => setSongDialogVisible(true)}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </div>

          {/* COLLABORATORS (usernames) */}
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
                  onChange={field.onChange}
                  appendTo={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  className="w-full"
                  placeholder="Choose collaborators"
                />
              )}
            />
          </div>

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
