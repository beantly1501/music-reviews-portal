package fer.jbockal.mrp_backend.dto.partial;

import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class AlbumPartialDto {
    private Long id;
    private String name;
    private byte[] cover;
    private String link;
    private Long year;
}
