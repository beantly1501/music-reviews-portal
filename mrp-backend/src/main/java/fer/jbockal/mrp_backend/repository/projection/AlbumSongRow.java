package fer.jbockal.mrp_backend.repository.projection;

public interface AlbumSongRow {
    Long getAlbumId();

    Long getId();

    String getName();

    String getLink();

    Long getYear();
}
