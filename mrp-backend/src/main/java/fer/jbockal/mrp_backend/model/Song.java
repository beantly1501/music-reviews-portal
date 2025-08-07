package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "song")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "cover", columnDefinition = "BYTEA")
    private byte[] cover;

    private String link;

    @Column(name = "file", columnDefinition = "BYTEA")
    private byte[] file;

    private Long year;

    // Many-to-many with Album
    @ManyToMany
    @JoinTable(
            name = "song_album",
            joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "album_id")
    )
    private Set<Album> albums = new HashSet<>();

    // Many-to-many with Artist
    @ManyToMany(mappedBy = "songs")
    private Set<Artist> artists = new HashSet<>();

    // Many-to-many with Genre
    @ManyToMany
    @JoinTable(
            name = "song_genre",
            joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();


    public Song(String name, byte[] cover, String link, byte[] file, Long year) {
        this.name = name;
        this.cover = cover;
        this.link = link;
        this.file = file;
        this.year = year;
    }

}
