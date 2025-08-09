package fer.jbockal.mrp_backend.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.LocalDate;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SongReviewResponseDto.class, name = "SONG"),
        @JsonSubTypes.Type(value = AlbumReviewResponseDto.class, name = "ALBUM")
})
public sealed interface ReviewResponseDto permits SongReviewResponseDto, AlbumReviewResponseDto {
    Long id();

    String username();

    Integer grade();

    String description();

    LocalDate creationDate();

    String image();
}
