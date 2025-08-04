package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.AlbumRating;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRatingRepository extends JpaRepository<AlbumRating, Long> {
    List<AlbumRating> findByAlbum(Album album);
    List<AlbumRating> findByUser(AppUser user);
    Optional<AlbumRating> findByIdAndUser(Long id, AppUser user);
}
