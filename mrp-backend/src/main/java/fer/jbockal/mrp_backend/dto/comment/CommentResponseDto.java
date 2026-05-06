package fer.jbockal.mrp_backend.dto.comment;

import java.time.LocalDateTime;

public record CommentResponseDto(
        Long id,
        Long reviewId,
        Long userId,
        String username,
        String content,
        LocalDateTime creationDate,
        LocalDateTime updatedDate
) {
}
