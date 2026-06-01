import { useState } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useGetGenres } from "../hooks/useGetGenres";
import { useCreateGenre } from "../hooks/useCreateGenre";
import { toast } from "./ToastContext";

export type GenreOption = {
  id: number;
  name: string;
};

type Props = {
  id?: string;
  value: number[];
  onChange: (value: number[]) => void;
  allowCreate?: boolean;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function GenresMultiSelect({
  id = "genreIdsSelect",
  value,
  onChange,
  allowCreate = false,
  appendTo,
  className,
  placeholder = "Select genres",
}: Props) {
  const { genres, loading, refetch } = useGetGenres();
  const { createGenre, isCreating } = useCreateGenre();
  const [newGenreName, setNewGenreName] = useState("");

  const onCreateGenre = async () => {
    const name = newGenreName.trim();
    if (!name) return;

    const ok = await createGenre(name);
    if (ok) {
      toast.success(`Genre "${name}" created`);
      setNewGenreName("");
      await refetch();
    } else {
      toast.error("Failed to create genre");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      void onCreateGenre();
    }
  };

  return (
    <MultiSelect
      id={id}
      value={value}
      options={genres as GenreOption[]}
      optionLabel="name"
      optionValue="id"
      onChange={(e: MultiSelectChangeEvent) => onChange(e.value as number[])}
      filter
      filterBy="name"
      display="chip"
      placeholder={placeholder}
      loading={loading}
      appendTo={appendTo}
      className={className}
      panelStyle={{ width: "400px" }}
      style={{ flexWrap: "wrap" }}
      panelFooterTemplate={allowCreate ? () => (
        <div className="flex items-center gap-2 p-3 border-t border-white/10">
          <InputText
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New genre name"
            className="flex-1 text-sm"
          />
          <Button
            icon="pi pi-plus"
            size="small"
            loading={isCreating}
            disabled={!newGenreName.trim()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void onCreateGenre();
            }}
          />
        </div>
      ) : undefined}
    />
  );
}
