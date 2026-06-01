import { useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent, MultiSelectFilterEvent } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import { useGetArtistsLazy } from "../../features/artists/hooks/useGetArtistsLazy.ts";

export type ArtistOption = {
  id: number;
  name: string;
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

export default function ArtistMultiSelect({
  id = "artistIdsSelect",
  value,
  onChange,
  appendTo,
  className,
  placeholder = "Select artists",
}: Props) {
  const { items, hasMore, loading, onFilter, loadMore, initialize } = useGetArtistsLazy();

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
