package fer.jbockal.mrp_backend.repository.projection;

import java.time.LocalDateTime;

public interface AlbumReviewRow {
    Long getId();

    Long getAlbumId();

    String getAlbumName();

    Long getUserId();

    String getUsername();

    Integer getGrade();

    String getDescription();

    LocalDateTime getCreationDate();
}
