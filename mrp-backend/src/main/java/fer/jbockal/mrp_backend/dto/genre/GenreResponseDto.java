package fer.jbockal.mrp_backend.dto.genre;

import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class GenreResponseDto {
    private Long id;
    private String name;
    private Set<SongPartialDto> songs;
}
