import { Dispatch, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtistCreateForm, artistCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
}

function parseIdList(input: string | undefined): number[] {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
}

export default function CreateArtistDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const methods = useForm<ArtistCreateForm>({
    resolver: zodResolver(artistCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<ArtistCreateForm> = useCallback(
    async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.image) {
        formData.append("image", data.image);
      }

      const songIdsInput = (
        document.getElementById("songIds") as HTMLInputElement
      )?.value;
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement
      )?.value;
      const songIds = parseIdList(songIdsInput);
      const albumIds = parseIdList(albumIdsInput);

      if (songIds.length > 0) {
        formData.append("songIds", JSON.stringify(songIds));
      }
      if (albumIds.length > 0) {
        formData.append("albumIds", JSON.stringify(albumIds));
      }

      const token = localStorage.getItem("jwt");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/artist/create", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create artist failed: ${res.status} ${text}`);
      }

      onCreated();
      setVisible(false);
    },
    [onCreated, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() => <div>Add an Artist</div>}
      onHide={() => setVisible(false)}
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
          </div>

          {/* SONG IDS */}
          <div className="field">
            <label htmlFor="songIds">
              Song IDs (comma-separated, optional)
            </label>
            <InputText id="songIds" placeholder="e.g. 1,2,5" />
          </div>

          {/* ALBUM IDS */}
          <div className="field">
            <label htmlFor="albumIds">
              Album IDs (comma-separated, optional)
            </label>
            <InputText id="albumIds" placeholder="e.g. 3,4" />
          </div>

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>
    </Dialog>
  );
}
