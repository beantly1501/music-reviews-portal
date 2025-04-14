package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "song_playlist")
public class SongPlaylist {

    @EmbeddedId
    private SongPlaylistId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;

    public SongPlaylist() {}
    public SongPlaylist(Song song, Playlist playlist) {
        this.song = song;
        this.playlist = playlist;
        this.id = new SongPlaylistId(song.getId(), playlist.getId());
    }
}

@Embeddable
class SongPlaylistId implements Serializable {

    @Column(name = "song_id")
    private Long songId;

    @Column(name = "playlist_id")
    private Long playlistId;

    public SongPlaylistId() {}
    public SongPlaylistId(Long songId, Long playlistId) {
        this.songId = songId;
        this.playlistId = playlistId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SongPlaylistId)) return false;
        SongPlaylistId that = (SongPlaylistId) o;
        return songId.equals(that.songId) && playlistId.equals(that.playlistId);
    }

    @Override
    public int hashCode() {
        return songId.hashCode() + playlistId.hashCode();
    }
}
