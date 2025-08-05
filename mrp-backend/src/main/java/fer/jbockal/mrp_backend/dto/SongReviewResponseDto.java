package fer.jbockal.mrp_backend.dto;

import java.time.LocalDate;

public record SongReviewResponseDto(
        Long id,
        Long songId,
        String username,
        Integer grade,
        String description,
        LocalDate creationDate
) implements ReviewResponseDto {}
