package fer.jbockal.mrp_backend.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.LocalDate;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SongRatingResponseDto.class, name = "SONG"),
        @JsonSubTypes.Type(value = AlbumRatingResponseDto.class, name = "ALBUM")
})
public sealed interface ReviewResponseDto permits SongRatingResponseDto, AlbumRatingResponseDto {
    Long id();
    String username();
    Integer grade();
    String description();
    LocalDate creationDate();
}
