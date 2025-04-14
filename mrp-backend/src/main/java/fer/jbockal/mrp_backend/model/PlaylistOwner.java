package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "playlist_owner")
public class PlaylistOwner {

    @EmbeddedId
    private PlaylistOwnerId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;

    public PlaylistOwner() {}
    public PlaylistOwner(AppUser user, Playlist playlist) {
        this.user = user;
        this.playlist = playlist;
        this.id = new PlaylistOwnerId(user.getId(), playlist.getId());
    }
}

@Embeddable
class PlaylistOwnerId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "playlist_id")
    private Long playlistId;

    public PlaylistOwnerId() {}
    public PlaylistOwnerId(Long userId, Long playlistId) {
        this.userId = userId;
        this.playlistId = playlistId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlaylistOwnerId)) return false;
        PlaylistOwnerId that = (PlaylistOwnerId) o;
        return userId.equals(that.userId) && playlistId.equals(that.playlistId);
    }

    @Override
    public int hashCode() {
        return userId.hashCode() + playlistId.hashCode();
    }
}
