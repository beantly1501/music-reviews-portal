package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.AlbumReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumReviewRepository extends JpaRepository<AlbumReview, Long> {
    List<AlbumReview> findByAlbum(Album album);
    List<AlbumReview> findByUser(AppUser user);
    Optional<AlbumReview> findByIdAndUser(Long id, AppUser user);
}
