package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.model.SongRatingId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SongRatingRepository extends JpaRepository<SongRating, SongRatingId> {

    List<SongRating> findTop20ByOrderByCreationDateDesc();
}
