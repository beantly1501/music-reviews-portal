package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "playlist")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private LocalDate creationDate;

    @ManyToOne
    @JoinColumn(name = "last_edited_by") // This column will store the AppUser id
    private AppUser lastEditedBy;

    public Playlist(String name, String description, LocalDate creationDate, AppUser lastEditedBy) {
        this.name = name;
        this.description = description;
        this.creationDate = creationDate;
        this.lastEditedBy = lastEditedBy;
    }
}
