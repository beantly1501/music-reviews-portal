import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";
import { Button } from "primereact/button";
import { AlbumReviewFormData, albumReviewSchema } from "@shared/utils";

export interface CreateAlbumReviewProps {
  visible: boolean;
  name: string;
  albumId: number;
  onHide: () => void;
  onSubmit: (data: AlbumReviewFormData) => Promise<void>;
  existingFormData?: AlbumReviewFormData;
}

export const CreateAlbumReview = ({
  visible,
  name,
  albumId,
  onHide,
  onSubmit,
  existingFormData,
}: CreateAlbumReviewProps) => {
  const methods = useForm<AlbumReviewFormData>({
    resolver: zodResolver(albumReviewSchema),
    defaultValues: existingFormData ?? { albumId, grade: 0, description: "" },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = methods;

  useEffect(() => {
    if (!existingFormData && visible) {
      reset({ albumId, grade: 0, description: "" });
    }
  }, [visible, albumId, reset]);

  const submitHandler = async (data: AlbumReviewFormData) => {
    await onSubmit(data as AlbumReviewFormData);
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
                <Rating
                  id="grade"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  cancel={false}
                  className="w-full justify-content-center"
                  stars={5}
                />
                {errors.grade && (
                  <small className="p-error">{errors.grade.message}</small>
                )}
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
