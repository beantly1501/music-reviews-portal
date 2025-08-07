package fer.jbockal.mrp_backend.dto.partial;

import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Genre;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
public class SongPartialDto {
    private Long id;
    private String name;
    private byte[] cover;
    private String link;
    private byte[] file;
    private Long year;
}
