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

    // Many-to-many with Album (bi-directional)
    @ManyToMany
    @JoinTable(
            name = "song_album",
            joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "album_id")
    )
    private Set<Album> albums = new HashSet<>();

    // Many-to-many with Author (bi-directional)
    @ManyToMany(mappedBy = "songs")
    private Set<Author> authors = new HashSet<>();

    public Song(String name, byte[] cover, String link, byte[] file, Long year) {
        this.name = name;
        this.cover = cover;
        this.link = link;
        this.file = file;
        this.year = year;
    }

}
