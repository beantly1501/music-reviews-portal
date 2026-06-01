import { useRef } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import GenresMultiSelect from "../../shared/components/GenresMultiSelect.tsx";
import ArtistMultiSelect from "../../shared/components/ArtistMultiSelect.tsx";
import SongMultiSelect from "../../shared/components/SongMultiSelect.tsx";
import type { AlbumFilters } from "./hooks/useGetAlbums.ts";

type Props = {
  filters: AlbumFilters;
  hasActiveFilters: boolean;
  onChange: (f: AlbumFilters) => void;
  onClear: () => void;
};

export default function AlbumFilterPanel({ filters, hasActiveFilters, onChange, onClear }: Props) {
  const op = useRef<OverlayPanel>(null);

  return (
    <>
      <Button
        icon="pi pi-filter"
        severity={hasActiveFilters ? "info" : "secondary"}
        outlined={!hasActiveFilters}
        onClick={(e) => op.current?.toggle(e)}
        aria-label="Filter albums"
      />

      <OverlayPanel ref={op} className="w-80">
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Filter albums</span>
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
            <label className="text-xs text-gray-400">Genre</label>
            <GenresMultiSelect
              value={filters.genreIds}
              onChange={(ids) => onChange({ ...filters, genreIds: ids })}
              placeholder="Any genre"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Artist</label>
            <ArtistMultiSelect
              value={filters.artistIds}
              onChange={(ids) => onChange({ ...filters, artistIds: ids })}
              placeholder="Any artist"
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
