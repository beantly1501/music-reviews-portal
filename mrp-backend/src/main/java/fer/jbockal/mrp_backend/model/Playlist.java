package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
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

    public Playlist() {}
    public Playlist(String name, String description, LocalDate creationDate, AppUser lastEditedBy) {
        this.name = name;
        this.description = description;
        this.creationDate = creationDate;
        this.lastEditedBy = lastEditedBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public AppUser getLastEditedBy() {
        return lastEditedBy;
    }

    public void setLastEditedBy(AppUser lastEditedBy) {
        this.lastEditedBy = lastEditedBy;
    }
}
