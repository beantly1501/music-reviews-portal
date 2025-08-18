package fer.jbockal.mrp_backend.dto.song;

import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.GenrePartialDto;

import java.math.BigDecimal;
import java.util.Set;

public record SongResponseDto(
        Long id,
        String name,
        String imageUrl,
        String fileUrl,
        String link,
        Long year,
        Set<AlbumPartialDto> albums,
        Set<ArtistPartialDto> artists,
        Set<GenrePartialDto> genres,
        Integer grade,
        BigDecimal averageRating
) {
}
