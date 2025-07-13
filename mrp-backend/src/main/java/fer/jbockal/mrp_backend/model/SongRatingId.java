package fer.jbockal.mrp_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Embeddable
public class SongRatingId implements Serializable {

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
        if (!(o instanceof SongRatingId that)) return false;
        return Objects.equals(songId, that.songId)
                && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(songId, userId);
    }
}
