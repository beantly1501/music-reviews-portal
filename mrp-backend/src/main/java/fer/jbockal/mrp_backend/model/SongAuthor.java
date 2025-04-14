package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "song_author")
public class SongAuthor {

    @EmbeddedId
    private SongAuthorId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("authorId")
    @JoinColumn(name = "author_id")
    private Author author;

    public SongAuthor() {}
    public SongAuthor(Song song, Author author) {
        this.song = song;
        this.author = author;
        this.id = new SongAuthorId(song.getId(), author.getId());
    }
}

@Embeddable
class SongAuthorId implements Serializable {

    @Column(name = "song_id")
    private Long songId;

    @Column(name = "author_id")
    private Long authorId;

    public SongAuthorId() {}
    public SongAuthorId(Long songId, Long authorId) {
        this.songId = songId;
        this.authorId = authorId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SongAuthorId)) return false;
        SongAuthorId that = (SongAuthorId) o;
        return songId.equals(that.songId) && authorId.equals(that.authorId);
    }

    @Override
    public int hashCode() {
        return songId.hashCode() + authorId.hashCode();
    }
}
