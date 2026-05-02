import { Dispatch, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getToken, SongCreateForm, songCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void;
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

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${VITE_BACKEND_URL}/song/create`, {
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
      visible={visible}
      header={() => <div>Add a song</div>}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
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

          <div className="flex justify-around gap-3">
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
                    maxFileSize={10_000_000}
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
          </div>

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

          <Button type="submit" label="Submit" className="mt-3" />
        </form>
      </FormProvider>
    </Dialog>
  );
}
