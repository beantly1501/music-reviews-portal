package fer.jbockal.mrp_backend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "song")
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Lob
    @Column(name = "cover", columnDefinition = "BYTEA")
    private byte[] cover;

    private String link;

    @Lob
    @Column(name = "file", columnDefinition = "BYTEA")
    private byte[] file;

    private LocalDate year;

    public Song() {}
    public Song(String name, byte[] cover, String link, byte[] file, LocalDate year) {
        this.name = name;
        this.cover = cover;
        this.link = link;
        this.file = file;
        this.year = year;
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

    public byte[] getCover() {
        return cover;
    }

    public void setCover(byte[] cover) {
        this.cover = cover;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public byte[] getFile() {
        return file;
    }

    public void setFile(byte[] file) {
        this.file = file;
    }

    public LocalDate getYear() {
        return year;
    }

    public void setYear(LocalDate year) {
        this.year = year;
    }
}
