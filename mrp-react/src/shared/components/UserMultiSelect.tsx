import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { UserOption } from "@shared/utils";

type Props = {
  id?: string;
  value: number[];
  options: UserOption[];
  loading?: boolean;
  onChange: (value: number[]) => void;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function UserMultiSelect({
  id = "collaboratorIdsSelect",
  value,
  options,
  loading,
  onChange,
  appendTo,
  className,
  placeholder = "Select collaborators",
}: Props) {
  return (
    <MultiSelect
      id={id}
      value={value}
      options={options}
      optionLabel="username"
      optionValue="id"
      onChange={(e: MultiSelectChangeEvent) => onChange(e.value as number[])}
      filter
      filterBy="username"
      display="chip"
      placeholder={placeholder}
      loading={loading}
      appendTo={appendTo}
      className={className}
      itemTemplate={(opt: UserOption) => (
        <div className="flex align-items-center justify-content-between w-full gap-2">
          <span>{opt.username}</span>
        </div>
      )}
    />
  );
}
