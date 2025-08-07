package fer.jbockal.mrp_backend.dto;

import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.GenrePartialDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Artist;
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
    private Set<AlbumPartialDto> albums;
    private Set<ArtistPartialDto> artists;
    private Set<GenrePartialDto> genres;
    private boolean reviewed;
    private Integer grade;
}
