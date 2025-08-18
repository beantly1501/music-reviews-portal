import { Dispatch, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { getToken } from "@shared/utils";

type Form = { name: string };

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  onCreated: () => void; // parent should refetch on success
}

export default function CreateGenreDialog({
  visible,
  setVisible,
  onCreated,
}: Props) {
  const methods = useForm<Form>({
    defaultValues: { name: "" },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      const token = getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/genre/create", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: data.name }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create genre failed: ${res.status} ${text}`);
      }

      onCreated();
      reset();
      setVisible(false);
    },
    [onCreated, reset, setVisible],
  );

  return (
    <Dialog
      visible={visible}
      header={() => <div>Create Genre</div>}
      onHide={() => setVisible(false)}
      resizable={false}
      draggable={false}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          <div className="field">
            <label htmlFor="genreName">Name</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => <InputText id="genreName" {...field} />}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message as string}</small>
            )}
          </div>

          <Button type="submit" label="Create" className="mt-3" />
        </form>
      </FormProvider>
    </Dialog>
  );
}
