package fer.jbockal.mrp_backend.dto;

import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class AlbumResponseDto {
    private Long id;
    private String name;
    private byte[] cover;
    private String link;
    private Long year;
    private Set<Song> songs;
    private Set<Author> authors;
    private boolean reviewed;
}
