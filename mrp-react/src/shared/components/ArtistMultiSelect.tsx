// src/features/artists/components/ArtistMultiSelect.tsx
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Button } from "primereact/button";

export type ArtistOption = {
  id: number;
  name: string;
};

type Props = {
  id?: string;
  value: number[];
  options: ArtistOption[];
  loading?: boolean;
  onChange: (value: number[]) => void;
  onCreateNew?: () => void;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function ArtistMultiSelect({
  id = "artistIdsSelect",
  value,
  options,
  loading,
  onChange,
  onCreateNew,
  appendTo,
  className,
  placeholder = "Select artists",
}: Props) {
  return (
    <MultiSelect
      id={id}
      value={value}
      options={options}
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
      panelFooterTemplate={() => (
        <div className="flex justify-content-center p-2">
          <Button
            label="Create New Artist"
            icon="pi pi-plus"
            className="p-button-text p-button-sm"
            onClick={(e) => {
              e.preventDefault();
              onCreateNew?.();
            }}
          />
        </div>
      )}
    />
  );
}
