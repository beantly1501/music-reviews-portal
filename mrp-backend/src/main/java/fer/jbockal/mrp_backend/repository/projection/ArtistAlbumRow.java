package fer.jbockal.mrp_backend.repository.projection;

public interface ArtistAlbumRow {
    Long getArtistId();

    Long getId();

    String getName();

    String getLink();

    Long getYear();
}
