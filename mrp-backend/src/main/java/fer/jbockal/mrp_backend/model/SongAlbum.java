package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "song_album")
public class SongAlbum {

    @EmbeddedId
    private SongAlbumId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("albumId")
    @JoinColumn(name = "album_id")
    private Album album;

    public SongAlbum() {}
    public SongAlbum(Song song, Album album) {
        this.song = song;
        this.album = album;
        this.id = new SongAlbumId(song.getId(), album.getId());
    }
}

@Embeddable
class SongAlbumId implements Serializable {
    @Column(name = "song_id")
    private Long songId;

    @Column(name = "album_id")
    private Long albumId;

    public SongAlbumId() {}
    public SongAlbumId(Long songId, Long albumId) {
        this.songId = songId;
        this.albumId = albumId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SongAlbumId)) return false;
        SongAlbumId that = (SongAlbumId) o;
        return songId.equals(that.songId) && albumId.equals(that.albumId);
    }

    @Override
    public int hashCode() {
        return songId.hashCode() + albumId.hashCode();
    }
}
