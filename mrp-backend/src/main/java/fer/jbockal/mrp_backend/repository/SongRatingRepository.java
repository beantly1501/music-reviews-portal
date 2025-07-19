package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.SongRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SongRatingRepository extends JpaRepository<SongRating, Long> {

    List<SongRating> findTop20ByOrderByCreationDateDesc();
}
