package fer.jbockal.mrp_backend.dto;

import java.time.LocalDate;

public record AlbumReviewResponseDto(
        Long id,
        Long albumId,
        String albumName,
        String username,
        Integer grade,
        String description,
        LocalDate creationDate,
        String image
) implements ReviewResponseDto {
}
