package fer.jbockal.mrp_backend.dto.artist;

import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class ArtistResponseDto {
    public Long id;
    private String name;
    private String imageUrl;
    private String description;
    private Set<AlbumPartialDto> albums;
    private Set<SongPartialDto> songs;

}
