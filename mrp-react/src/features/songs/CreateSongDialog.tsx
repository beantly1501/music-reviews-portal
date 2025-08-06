import { Dispatch, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SongCreateForm, songCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
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

export default function CreateSongDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const methods = useForm<SongCreateForm>({
    resolver: zodResolver(songCreateSchema),
    defaultValues: {
      name: "",
      link: "",
      year: undefined,
      file: undefined,
      cover: undefined,
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<SongCreateForm> = useCallback(
    async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.link) formData.append("link", data.link);
      if (data.year !== undefined && data.year !== null)
        formData.append("year", String(data.year));
      if (data.cover) formData.append("cover", data.cover);
      if (data.file) formData.append("file", data.file);

      // grab the raw string values from some extra inputs below
      const albumIdsInput = (
        document.getElementById("albumIds") as HTMLInputElement
      )?.value;
      const authorIdsInput = (
        document.getElementById("authorIds") as HTMLInputElement
      )?.value;

      const albumIds = parseIdList(albumIdsInput);
      const authorIds = parseIdList(authorIdsInput);

      if (albumIds.length > 0) {
        formData.append("albumIds", JSON.stringify(albumIds));
      }
      if (authorIds.length > 0) {
        formData.append("authorIds", JSON.stringify(authorIds));
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
      className="w-25rem"
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
              render={({ field }) => (
                <InputText required id="name" {...field} />
              )}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

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
                  maxFileSize={10000000}
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
                  required
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

          {/* ALBUM IDS */}
          <div className="field">
            <label htmlFor="albumIds">
              Album IDs (comma-separated, optional)
            </label>
            <InputText id="albumIds" placeholder="e.g. 1,2,5" />
          </div>

          {/* AUTHOR IDS */}
          <div className="field">
            <label htmlFor="authorIds">
              Author IDs (comma-separated, optional)
            </label>
            <InputText id="authorIds" placeholder="e.g. 3,4" />
          </div>

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>
    </Dialog>
  );
}
