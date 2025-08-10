package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.AlbumReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.repository.projection.AlbumReviewRow;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumReviewRepository extends JpaRepository<AlbumReview, Long> {
    List<AlbumReview> findByAlbum(Album album);

    List<AlbumReview> findByUser(AppUser user);

    Optional<AlbumReview> findByIdAndUser(Long id, AppUser user);

    @Query("""
            select ar.id as id,
                   a.id as albumId,
                   a.name as albumName,
                   u.username as username,
                   ar.grade as grade,
                   ar.description as description,
                   ar.creationDate as creationDate
            from AlbumReview ar
            join ar.album a
            join ar.user u
            order by ar.creationDate desc
            """)
    List<AlbumReviewRow> findAllRows();

    @Query("""
            select ar.id as id,
                   a.id as albumId,
                   a.name as albumName,
                   u.username as username,
                   ar.grade as grade,
                   ar.description as description,
                   ar.creationDate as creationDate
            from AlbumReview ar
            join ar.album a
            join ar.user u
            order by ar.creationDate desc
            """)
    List<AlbumReviewRow> findAllRows(Pageable pageable);

    @Query("""
            select ar.id as id,
                   a.id as albumId,
                   a.name as albumName,
                   u.username as username,
                   ar.grade as grade,
                   ar.description as description,
                   ar.creationDate as creationDate
            from AlbumReview ar
            join ar.album a
            join ar.user u
            where u = :user
            order by ar.creationDate desc
            """)
    List<AlbumReviewRow> findRowsByUser(@Param("user") AppUser user);

    @Query("""
            select ar.id as id,
                   a.id as albumId,
                   a.name as albumName,
                   u.username as username,
                   ar.grade as grade,
                   ar.description as description,
                   ar.creationDate as creationDate
            from AlbumReview ar
            join ar.album a
            join ar.user u
            where u = :user
            order by ar.creationDate desc
            """)
    List<AlbumReviewRow> findRowsByUser(@Param("user") AppUser user, Pageable pageable);
}
