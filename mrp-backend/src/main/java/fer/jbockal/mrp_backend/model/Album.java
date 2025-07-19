package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "album")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "cover", columnDefinition = "BYTEA")
    private byte[] cover;

    private String link;
    private Long year;

    public Album(String name, byte[] cover, String link, Long year) {
        this.name = name;
        this.cover = cover;
        this.link = link;
        this.year = year;
    }

}
