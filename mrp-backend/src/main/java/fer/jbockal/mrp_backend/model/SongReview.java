package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@AllArgsConstructor
@Table(name = "song_review", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "song_id"})
})
public class SongReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)        // << lazy by default for ManyToOne, but good to be explicit
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @ManyToOne(fetch = FetchType.LAZY)        // << lazy by default for ManyToOne, but good to be explicit
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    private Integer grade;
    private String description;
    private LocalDateTime creationDate;
}
