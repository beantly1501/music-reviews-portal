package fer.jbockal.mrp_backend.dto.review;

import java.time.LocalDateTime;

public record AlbumReviewResponseDto(
        Long id,
        Long albumId,
        String albumName,
        Long userId,
        String username,
        Integer grade,
        String description,
        LocalDateTime creationDate,
        String image
) implements ReviewResponseDto {
}
