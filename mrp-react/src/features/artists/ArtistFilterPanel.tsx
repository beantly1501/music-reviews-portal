import { useRef } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import AlbumMultiSelect from "../../shared/components/AlbumMultiSelect.tsx";
import SongMultiSelect from "../../shared/components/SongMultiSelect.tsx";
import type { ArtistFilters } from "./hooks/useGetArtists.ts";

type Props = {
  filters: ArtistFilters;
  hasActiveFilters: boolean;
  onChange: (f: ArtistFilters) => void;
  onClear: () => void;
};

export default function ArtistFilterPanel({ filters, hasActiveFilters, onChange, onClear }: Props) {
  const op = useRef<OverlayPanel>(null);

  return (
    <>
      <Button
        icon="pi pi-filter"
        severity={hasActiveFilters ? "info" : "secondary"}
        outlined={!hasActiveFilters}
        onClick={(e) => op.current?.toggle(e)}
        aria-label="Filter artists"
      />

      <OverlayPanel ref={op} className="w-80">
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Filter artists</span>
            {hasActiveFilters && (
              <Button
                label="Clear all"
                size="small"
                severity="secondary"
                text
                onClick={() => {
                  onClear();
                  op.current?.hide();
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Album</label>
            <AlbumMultiSelect
              value={filters.albumIds}
              onChange={(ids) => onChange({ ...filters, albumIds: ids })}
              placeholder="Any album"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Song</label>
            <SongMultiSelect
              value={filters.songIds}
              onChange={(ids) => onChange({ ...filters, songIds: ids })}
              placeholder="Any song"
              className="w-full"
            />
          </div>
        </div>
      </OverlayPanel>
    </>
  );
}
