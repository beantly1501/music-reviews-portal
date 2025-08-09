import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Button } from "primereact/button";

export type SongOption = {
  id: number;
  name: string;
  year?: number | null;
};

type Props = {
  id?: string;
  value: number[];
  options: SongOption[];
  loading?: boolean;
  onChange: (value: number[]) => void;
  onCreateNew?: () => void;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function SongMultiSelect({
  id = "songIdsSelect",
  value,
  options,
  loading,
  onChange,
  onCreateNew,
  appendTo,
  className,
  placeholder = "Select songs",
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
      filterBy="name,year"
      display="chip"
      placeholder={placeholder}
      loading={loading}
      appendTo={appendTo}
      className={className}
      itemTemplate={(opt: SongOption) => (
        <div className="flex align-items-center justify-content-between w-full gap-2">
          <span>{opt.name}</span>
          {opt.year ? <small className="text-500">{opt.year}</small> : null}
        </div>
      )}
      /* keep PrimeReact header (with built-in filter) and add our button to the footer */
      panelFooterTemplate={() => (
        <div className="flex justify-content-center p-2">
          <Button
            label="Create New Song"
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
