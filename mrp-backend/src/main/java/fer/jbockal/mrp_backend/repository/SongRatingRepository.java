package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRatingRepository extends JpaRepository<SongRating, Long> {
    List<SongRating> findBySong(Song song);
    List<SongRating> findByUser(AppUser user);
    Optional<SongRating> findByIdAndUser(Long id, AppUser user);
}
