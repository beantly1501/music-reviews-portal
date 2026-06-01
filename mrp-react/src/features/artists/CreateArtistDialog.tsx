import {
  Dispatch,
  useCallback,
  useEffect,
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
  ArtistCreateForm,
  artistCreateSchema,
  ArtistRequestData,
  truncate,
} from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

import CreateLimitedSongDialog from "../../shared/components/CreateLimitedSongDialog.tsx";
import CreateLimitedAlbumDialog from "../../shared/components/CreateLimitedAlbumDialog.tsx";

import SongMultiSelect from "../../shared/components/SongMultiSelect.tsx";
import AlbumMultiSelect from "../../shared/components/AlbumMultiSelect.tsx";
import { createArtist, updateArtist } from "./utils/helpers.tsx";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
  existingArtistData?: ArtistRequestData;
}

const EMPTY_FORM: ArtistCreateForm = {
  name: "",
  description: "",
  image: undefined,
  songIds: [],
  albumIds: [],
};

export default function CreateArtistDialog({
  visible,
  setVisible,
  onCreated,
  existingArtistData,
}: Props) {
  const [songDialogVisible, setSongDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  const coverUploadRef = useRef<FileUpload>(null);
  const [coverName, setCoverName] = useState<string>("Choose");

  const handleSongCreated = useCallback(() => {
    setSongDialogVisible(false);
  }, []);

  const handleAlbumCreated = useCallback(() => {
    setAlbumDialogVisible(false);
  }, []);

  const methods = useForm<ArtistCreateForm>({
    resolver: zodResolver(artistCreateSchema),
    defaultValues: EMPTY_FORM,
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    const nextDefaults: ArtistCreateForm = existingArtistData
      ? {
          name: existingArtistData.formData.name ?? "",
          description: existingArtistData.formData.description ?? "",
          image: undefined,
          songIds: existingArtistData.formData.songIds ?? [],
          albumIds: existingArtistData.formData.albumIds ?? [],
        }
      : EMPTY_FORM;

    reset(nextDefaults);
    setCoverName(
      existingArtistData?.formData.image ? "Change Existing" : "Choose",
    );
  }, [existingArtistData, visible, reset]);

  const onSubmit: SubmitHandler<ArtistCreateForm> = useCallback(
    async (data) => {
      const normalized: ArtistCreateForm = {
        ...data,
        songIds: data.songIds ?? [],
        albumIds: data.albumIds ?? [],
      };

      try {
        if (existingArtistData?.artistId) {
          await updateArtist({
            artistId: existingArtistData.artistId,
            formData: normalized,
          });
          toast.success("Artist updated.");
        } else {
          await createArtist({ formData: normalized });
          toast.success("Artist created.");
        }
        onCreated();
        setVisible(false);
      } catch {
        toast.error(
          existingArtistData?.artistId
            ? "Failed to update artist."
            : "Failed to create artist.",
        );
      }
    },
    [onCreated, setVisible, existingArtistData],
  );

  return (
    <Dialog
      visible={visible}
      header={() =>
        existingArtistData ? <div>Edit Artist</div> : <div>Add an Artist</div>
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
          className="p-fluid flex flex-col gap-2"
        >
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
                    icon: existingArtistData ? "pi pi-sync" : "pi pi-plus",
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
            <label htmlFor="songIdsSelect">Songs (optional)</label>
            <Controller
              name="songIds"
              control={control}
              render={({ field }) => (
                <SongMultiSelect
                  value={field.value ?? []}
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
      <CreateLimitedAlbumDialog
        visible={albumDialogVisible}
        setVisible={setAlbumDialogVisible}
        onCreated={handleAlbumCreated}
      />
    </Dialog>
  );
}
