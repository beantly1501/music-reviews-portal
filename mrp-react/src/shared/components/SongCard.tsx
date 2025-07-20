import { BACKEND_URL, SongType } from "@shared/utils";

interface Props {
  song: SongType;
}

export function SongCard({ song }: Props) {
  // build the URL for your streaming endpoint
  const audioSrc = `${BACKEND_URL}/song/audio-file/${song.id}`;

  return (
    <div className="song-card">
      <h3>{song.name}</h3>
      {song.file && (
        <audio controls src={audioSrc}>
          Your browser doesn’t support inline audio.
        </audio>
      )}
      {/* … anything else (cover art, link, year) … */}
    </div>
  );
}
