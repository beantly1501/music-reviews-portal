package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "playlist", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"owner_id", "name"})
})
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image", columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] image;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private boolean isPrivate = false;

    private LocalDate creationDate = LocalDate.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    @ManyToOne
    @JoinColumn(name = "last_edited_by")
    private AppUser lastEditedBy;

    @ManyToMany
    @JoinTable(name = "playlist_song",
            joinColumns = @JoinColumn(name = "playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id"))
    private Set<Song> songs = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "playlist_collaborator",
            joinColumns = @JoinColumn(name = "playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<AppUser> collaborators = new HashSet<>();

    public Playlist(String name, byte[] image, String description, boolean isPrivate, AppUser owner, AppUser lastEditedBy) {
        this.name = name;
        this.image = image;
        this.description = description;
        this.isPrivate = isPrivate;
        this.owner = owner;
        this.lastEditedBy = lastEditedBy;
        this.creationDate = LocalDate.now();
    }
}
