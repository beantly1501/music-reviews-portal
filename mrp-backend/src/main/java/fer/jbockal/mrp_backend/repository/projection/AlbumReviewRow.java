package fer.jbockal.mrp_backend.repository.projection;

import java.time.LocalDate;

public interface AlbumReviewRow {
    Long getId();

    Long getAlbumId();

    String getAlbumName();

    Long getUserId();

    String getUsername();

    Integer getGrade();

    String getDescription();

    LocalDate getCreationDate();
}
