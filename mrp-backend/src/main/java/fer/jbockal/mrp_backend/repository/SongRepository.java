package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Song;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    default Page<Song> findNewest(int limit) {
        Pageable p = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return findAll(p);
    }
}
