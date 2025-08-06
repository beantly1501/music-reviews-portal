package fer.jbockal.mrp_backend.dto;

import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Genre;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class SongResponseDto {
    private Long id;
    private String name;
    private byte[] cover;
    private String link;
    private byte[] file;
    private Long year;
    private Set<Album> albums;
    private Set<Author> authors;
    private Set<Genre> genres;
    private boolean reviewed;
}
