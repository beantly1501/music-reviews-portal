package fer.jbockal.mrp_backend.dto;

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
    private byte[] image;
    private String description;
    private Set<SongPartialDto> songs;
    private Set<AlbumPartialDto> albums;
}
