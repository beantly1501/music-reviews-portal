package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@Entity
@AllArgsConstructor
@Table(name = "song_rating")
public class SongRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optionally, load the Song and User objects
    @ManyToOne(fetch = FetchType.LAZY)        // << lazy by default for ManyToOne, but good to be explicit
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @ManyToOne(fetch = FetchType.LAZY)        // << lazy by default for ManyToOne, but good to be explicit
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    private Integer grade;
    private String description;
    private LocalDate creationDate;
}
