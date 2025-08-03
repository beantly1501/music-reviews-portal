package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "author")
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "image", columnDefinition = "BYTEA")
    private byte[] image;

    private String description;

    // Many-to-many with Song
    @ManyToMany
    @JoinTable(
            name = "song_author",
            joinColumns = @JoinColumn(name = "author_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    private Set<Song> songs = new HashSet<>();

    // Many-to-many with Album
    @ManyToMany
    @JoinTable(
            name = "album_author",
            joinColumns = @JoinColumn(name = "author_id"),
            inverseJoinColumns = @JoinColumn(name = "album_id")
    )
    private Set<Album> albums = new HashSet<>();
}
