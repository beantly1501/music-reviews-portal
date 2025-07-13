package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "album_rating")
public class AlbumRating {

    @EmbeddedId
    private AlbumRatingId id;

    @ManyToOne
    @MapsId("albumId")
    @JoinColumn(name = "album_id")
    private Album album;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private AppUser user;

    private Integer grade;
    private String description;
    private LocalDate creationDate;

    public AlbumRating() {}
    public AlbumRating(Album album, AppUser user, Integer grade, String description, LocalDate creationDate) {
        this.album = album;
        this.user = user;
        this.grade = grade;
        this.description = description;
        this.creationDate = creationDate;
        this.id = new AlbumRatingId(album.getId(), user.getId());
    }
}

@Embeddable
class AlbumRatingId implements Serializable {

    @Column(name = "album_id")
    private Long albumId;

    @Column(name = "user_id")
    private Long userId;

    public AlbumRatingId() {}
    public AlbumRatingId(Long albumId, Long userId) {
        this.albumId = albumId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AlbumRatingId)) return false;
        AlbumRatingId that = (AlbumRatingId) o;
        return albumId.equals(that.albumId) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return albumId.hashCode() + userId.hashCode();
    }
}
