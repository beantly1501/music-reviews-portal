package fer.jbockal.mrp_backend.repository.projection;

import java.time.LocalDateTime;

public interface SongReviewCommentRow {
    Long getId();
    Long getReviewId();
    Long getUserId();
    String getUsername();
    String getContent();
    LocalDateTime getCreationDate();
    LocalDateTime getUpdatedDate();
}
