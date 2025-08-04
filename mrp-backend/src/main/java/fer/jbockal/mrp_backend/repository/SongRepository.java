package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    // find songs whose name contains the fragment, case insensitive
    List<Song> findByNameContainingIgnoreCase(String fragment);
}
