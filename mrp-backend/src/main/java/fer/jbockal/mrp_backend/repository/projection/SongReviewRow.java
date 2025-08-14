package fer.jbockal.mrp_backend.repository.projection;

import java.time.LocalDate;

public interface SongReviewRow {
    Long getId();

    Long getSongId();

    String getSongName();

    Long getUserId();

    String getUsername();

    Integer getGrade();

    String getDescription();

    LocalDate getCreationDate();
}
