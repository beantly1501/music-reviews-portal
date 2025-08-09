package fer.jbockal.mrp_backend.repository.projection;

public interface ArtistSongRow {
    Long getArtistId();

    Long getId();

    String getName();

    String getLink();

    Long getYear();
}
