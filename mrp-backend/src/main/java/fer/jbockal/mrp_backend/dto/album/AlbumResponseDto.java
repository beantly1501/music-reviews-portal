package fer.jbockal.mrp_backend.dto.album;

import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class AlbumResponseDto {
    private Long id;
    private String name;
    private String imageUrl;
    private String link;
    private Long year;
    private Set<SongPartialDto> songs;
    private Set<ArtistPartialDto> artists;
    private Integer grade;
}
