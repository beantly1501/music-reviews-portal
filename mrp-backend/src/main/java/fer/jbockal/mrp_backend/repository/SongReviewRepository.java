package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.SongReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongReviewRepository extends JpaRepository<SongReview, Long> {
    List<SongReview> findBySong(Song song);
    List<SongReview> findByUser(AppUser user);
    Optional<SongReview> findByIdAndUser(Long id, AppUser user);
}
