package fer.jbockal.mrp_backend.dto;

import java.time.LocalDate;

public record SongRatingResponseDto(
        Long id,
        Long songId,
        String username,
        Integer grade,
        String description,
        LocalDate creationDate
) implements ReviewResponseDto {}
