import { useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";
import { Button } from "primereact/button";
import { SongReviewFormData, songReviewSchema } from "@shared/utils";

export interface SongReviewModalProps {
  visible: boolean;
  name: string;
  songId: number;
  onHide: () => void;
  onSubmit: (data: SongReviewFormData) => Promise<void>;
  existingFormData?: SongReviewFormData;
}

export const CreateSongReview = ({
  visible,
  name,
  songId,
  onHide,
  onSubmit,
  existingFormData,
}: SongReviewModalProps) => {
  const methods = useForm<SongReviewFormData>({
    resolver: zodResolver(songReviewSchema),
    defaultValues: existingFormData ?? { songId, grade: 0, description: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = methods;

  useEffect(() => {
    if (!existingFormData && visible) {
      reset({ songId, grade: 0, description: "" });
    }
  }, [visible, songId, reset]);

  const submitHandler = async (data: SongReviewFormData) => {
    await onSubmit(data);
    onHide();
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={handleSubmit(submitHandler)}
      />
    </div>
  );

  return (
    <Dialog
      header={existingFormData ? `Update ${name}` : name}
      visible={visible}
      modal
      footer={footer}
      onHide={onHide}
      style={{ width: "400px" }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(submitHandler)} className="p-fluid">
          <Controller
            name="grade"
            control={control}
            render={({ field }) => (
              <div className="flex flex-column gap-1 mb-3">
                <label htmlFor="grade" style={{ width: "100px" }}>
                  Grade
                </label>
                <div>
                  <Rating
                    id="grade"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    cancel={false}
                    className="w-full justify-content-center"
                    stars={5}
                  />
                </div>
              </div>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="flex flex-column gap-2">
                <label htmlFor="description">Description</label>
                <InputTextarea
                  id="description"
                  {...field}
                  rows={5}
                  autoResize
                  className={errors.description ? "p-invalid" : ""}
                />
                {errors.description && (
                  <small className="p-error">
                    {errors.description.message}
                  </small>
                )}
              </div>
            )}
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};
