import { Dispatch } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileToBase64, SongCreateForm, songCreateSchema } from "@shared/utils";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";

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

  const onSubmit: SubmitHandler<SongCreateForm> = async (data) => {
    // 1) convert files
    const coverBase64 = data.cover ? await fileToBase64(data.cover) : undefined;
    const fileBase64 = data.file ? await fileToBase64(data.file) : undefined;

    // 2) assemble DTO
    const payload = {
      name: data.name,
      link: data.link,
      year: data.year,
      cover: coverBase64,
      file: fileBase64,
    };

    // 3) POST to backend
    const res = await fetch("http://localhost:8080/api/song/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);

    // 4) tell parent to reload & close dialog
    onCreated();
    setVisible(false);
  };

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
                    // pull the first File out and feed RHF
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
                  // convert numeric field.value into a string for InputText
                  value={field.value !== undefined ? String(field.value) : ""}
                  // parse back to number for RHF
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
