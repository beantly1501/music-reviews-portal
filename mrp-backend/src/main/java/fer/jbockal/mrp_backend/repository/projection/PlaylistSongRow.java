package fer.jbockal.mrp_backend.repository.projection;

public interface PlaylistSongRow {
    Long getPlaylistId();

    Long getId();

    String getName();

    String getLink();

    Long getYear();
}
