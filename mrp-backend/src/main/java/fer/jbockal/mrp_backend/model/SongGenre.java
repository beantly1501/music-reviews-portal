package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "song_genre")
public class SongGenre {

    @EmbeddedId
    private SongGenreId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("genreId")
    @JoinColumn(name = "genre_id")
    private Genre genre;

    public SongGenre() {}
    public SongGenre(Song song, Genre genre) {
        this.song = song;
        this.genre = genre;
        this.id = new SongGenreId(song.getId(), genre.getId());
    }
}

@Embeddable
class SongGenreId implements Serializable {

    @Column(name = "song_id")
    private Long songId;

    @Column(name = "genre_id")
    private Long genreId;

    public SongGenreId() {}
    public SongGenreId(Long songId, Long genreId) {
        this.songId = songId;
        this.genreId = genreId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SongGenreId)) return false;
        SongGenreId that = (SongGenreId) o;
        return songId.equals(that.songId) && genreId.equals(that.genreId);
    }

    @Override
    public int hashCode() {
        return songId.hashCode() + genreId.hashCode();
    }
}
