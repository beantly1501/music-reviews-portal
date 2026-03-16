package fer.jbockal.mrp_backend.dto.review;

import java.time.LocalDateTime;

public record SongReviewResponseDto(
        Long id,
        Long songId,
        String songName,
        Long userId,
        String username,
        Integer grade,
        String description,
        LocalDateTime creationDate,
        String image
) implements ReviewResponseDto {
}
