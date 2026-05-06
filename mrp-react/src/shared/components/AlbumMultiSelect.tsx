import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";

export type AlbumOption = {
  id: number;
  name: string;
  year: number;
};

type Props = {
  id?: string;
  value: number[];
  options: AlbumOption[];
  loading?: boolean;
  onChange: (value: number[]) => void;
  onCreateNew?: () => void;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function AlbumMultiSelect({
  id = "albumIdsSelect",
  value,
  options,
  loading,
  onChange,
  appendTo,
  className,
  placeholder = "Select albums",
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
      itemTemplate={(opt: AlbumOption) => (
        <div className="flex items-center justify-between w-full gap-2">
          <span>{opt.name}</span>
          <small className="text-gray-500">{opt.year}</small>
        </div>
      )}
      // panelFooterTemplate={() => (
      //   <div className="flex justify-center p-2">
      //     <Button
      //       label="Create New Album"
      //       icon="pi pi-plus"
      //       className="p-button-text p-button-sm"
      //       onClick={(e) => {
      //         e.preventDefault();
      //         onCreateNew?.();
      //       }}
      //     />
      //   </div>
      // )}
    />
  );
}
