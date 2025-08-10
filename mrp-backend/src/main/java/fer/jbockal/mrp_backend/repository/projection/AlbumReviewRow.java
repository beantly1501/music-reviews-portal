package fer.jbockal.mrp_backend.repository.projection;

import java.time.LocalDate;

public interface AlbumReviewRow {
    Long getId();

    Long getAlbumId();

    String getAlbumName();

    String getUsername();

    Integer getGrade();

    String getDescription();

    LocalDate getCreationDate();
}
