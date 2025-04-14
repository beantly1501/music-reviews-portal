package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "song_rating")
public class SongRating {

    @EmbeddedId
    private SongRatingId id;

    // Optionally, load the Song and User objects
    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private AppUser user;

    private Integer grade;
    private String description;
    private LocalDate creationDate;

    public SongRating() {}
    public SongRating(Song song, AppUser user, Integer grade, String description, LocalDate creationDate) {
        this.song = song;
        this.user = user;
        this.grade = grade;
        this.description = description;
        this.creationDate = creationDate;
        this.id = new SongRatingId(song.getId(), user.getId());
    }
}

@Embeddable
class SongRatingId implements Serializable {

    @Column(name = "song_id")
    private Long songId;

    @Column(name = "user_id")
    private Long userId;

    public SongRatingId() {}
    public SongRatingId(Long songId, Long userId) {
        this.songId = songId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SongRatingId)) return false;
        SongRatingId that = (SongRatingId) o;
        return songId.equals(that.songId) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return songId.hashCode() + userId.hashCode();
    }
}
