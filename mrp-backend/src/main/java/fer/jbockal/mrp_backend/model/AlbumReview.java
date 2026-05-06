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
@Table(name = "album_review", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "album_id"})
})
public class AlbumReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    private Integer grade;
    private String description;
    private LocalDateTime creationDate;
}
