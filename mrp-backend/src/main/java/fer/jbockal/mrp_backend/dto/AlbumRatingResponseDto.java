package fer.jbockal.mrp_backend.dto;

import java.time.LocalDate;

public record AlbumRatingResponseDto(
        Long id,
        Long albumId,
        String username,
        Integer grade,
        String description,
        LocalDate creationDate
) {}
