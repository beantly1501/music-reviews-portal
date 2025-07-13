package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
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

    public SongRating(Song song, AppUser user, Integer grade, String description, LocalDate creationDate) {
        this.song = song;
        this.user = user;
        this.grade = grade;
        this.description = description;
        this.creationDate = creationDate;
        this.id = new SongRatingId(song.getId(), user.getId());
    }
}
