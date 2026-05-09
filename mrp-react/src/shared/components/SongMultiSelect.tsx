import { useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent, MultiSelectFilterEvent } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import { useGetSongsLazy } from "../../features/songs/hooks/useGetSongsLazy.ts";

export type SongOption = {
  id: number;
  name: string;
  year?: number | null;
};

type Props = {
  id?: string;
  value: number[];
  onChange: (value: number[]) => void;
  onCreateNew?: () => void;
  appendTo?: HTMLElement | null | undefined;
  className?: string;
  placeholder?: string;
};

export default function SongMultiSelect({
  id = "songIdsSelect",
  value,
  onChange,
  appendTo,
  className,
  placeholder = "Select songs",
}: Props) {
  const { items, hasMore, loading, onFilter, loadMore, initialize } = useGetSongsLazy();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <MultiSelect
      id={id}
      value={value}
      options={items}
      optionLabel="name"
      optionValue="id"
      onChange={(e: MultiSelectChangeEvent) => onChange(e.value as number[])}
      filter
      onFilter={(e: MultiSelectFilterEvent) => onFilter(e.filter)}
      display="chip"
      placeholder={placeholder}
      loading={loading}
      appendTo={appendTo}
      className={className}
      panelStyle={{ width: "400px" }}
      style={{ flexWrap: "wrap" }}
      scrollHeight="200px"
      itemTemplate={(opt: SongOption) => (
        <div className="flex items-center justify-between w-full gap-2">
          <span>{opt.name}</span>
          {opt.year ? <small className="text-gray-500">{opt.year}</small> : null}
        </div>
      )}
      panelFooterTemplate={() =>
        hasMore ? (
          <div
            className="flex justify-center items-center py-2 cursor-pointer text-sm text-blue-400 hover:text-blue-300"
            onClick={loadMore}
          >
            {loading ? <ProgressSpinner style={{ width: "1.25rem", height: "1.25rem" }} /> : "Load more…"}
          </div>
        ) : null
      }
    />
  );
}
