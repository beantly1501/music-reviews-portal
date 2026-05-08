import { useRef } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import GenresMultiSelect from "../../shared/components/GenresMultiSelect.tsx";
import AlbumMultiSelect, { AlbumOption } from "../../shared/components/AlbumMultiSelect.tsx";
import ArtistMultiSelect, { ArtistOption } from "../../shared/components/ArtistMultiSelect.tsx";
import { useGetAlbums } from "../albums/hooks/useGetAlbums.ts";
import { useGetArtists } from "../artists/hooks/useGetArtists.ts";
import type { SongFilters } from "./hooks/useGetSongs.tsx";

type Props = {
  filters: SongFilters;
  hasActiveFilters: boolean;
  onChange: (f: SongFilters) => void;
  onClear: () => void;
};

export default function SongFilterPanel({ filters, hasActiveFilters, onChange, onClear }: Props) {
  const op = useRef<OverlayPanel>(null);
  const { albums, loading: albumsLoading } = useGetAlbums({ size: 200 });
  const { artists, loading: artistsLoading } = useGetArtists();

  const albumOptions: AlbumOption[] = albums.map((a) => ({ id: a.id, name: a.name, year: a.year }));
  const artistOptions: ArtistOption[] = artists.map((a) => ({ id: a.id, name: a.name }));

  return (
    <>
      <Button
        icon="pi pi-filter"
        severity={hasActiveFilters ? "info" : "secondary"}
        outlined={!hasActiveFilters}
        onClick={(e) => op.current?.toggle(e)}
        aria-label="Filter songs"
        badge={hasActiveFilters
          ? String(filters.genreIds.length + filters.artistIds.length + filters.albumIds.length)
          : undefined}
      />

      <OverlayPanel ref={op} className="w-80">
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Filter songs</span>
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
              options={artistOptions}
              loading={artistsLoading}
              onChange={(ids) => onChange({ ...filters, artistIds: ids })}
              placeholder="Any artist"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Album</label>
            <AlbumMultiSelect
              value={filters.albumIds}
              options={albumOptions}
              loading={albumsLoading}
              onChange={(ids) => onChange({ ...filters, albumIds: ids })}
              placeholder="Any album"
              className="w-full"
            />
          </div>
        </div>
      </OverlayPanel>
    </>
  );
}
