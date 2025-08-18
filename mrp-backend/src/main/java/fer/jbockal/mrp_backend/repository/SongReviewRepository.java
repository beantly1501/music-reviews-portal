package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.SongReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.projection.SongAverageProjection;
import fer.jbockal.mrp_backend.repository.projection.SongReviewRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongReviewRepository extends JpaRepository<SongReview, Long> {
    List<SongReview> findBySong(Song song);

    List<SongReview> findByUser(AppUser user);

    Optional<SongReview> findByIdAndUser(Long id, AppUser user);

    @Query("""
            select sr.id as id,
                   s.id as songId,
                   s.name as songName,
                   u.id as userId,
                   u.username as username,
                   sr.grade as grade,
                   sr.description as description,
                   sr.creationDate as creationDate
            from SongReview sr
            join sr.song s
            join sr.user u
            order by sr.creationDate desc
            """)
    List<SongReviewRow> findAllRows();

    @Query("""
            select sr.id as id,
                   s.id as songId,
                   s.name as songName,
                   u.id as userId,
                   u.username as username,
                   sr.grade as grade,
                   sr.description as description,
                   sr.creationDate as creationDate
            from SongReview sr
            join sr.song s
            join sr.user u
            order by sr.creationDate desc
            """)
    List<SongReviewRow> findAllRows(Pageable pageable);

    @Query("""
            select sr.id as id,
                   s.id as songId,
                   s.name as songName,
                   u.id as userId,
                   u.username as username,
                   sr.grade as grade,
                   sr.description as description,
                   sr.creationDate as creationDate
            from SongReview sr
            join sr.song s
            join sr.user u
            where u = :user
            order by sr.creationDate desc
            """)
    List<SongReviewRow> findRowsByUser(@Param("user") AppUser user);

    @Query("""
            select sr.id as id,
                   s.id as songId,
                   s.name as songName,
                   u.id as userId,
                   u.username as username,
                   sr.grade as grade,
                   sr.description as description,
                   sr.creationDate as creationDate
            from SongReview sr
            join sr.song s
            join sr.user u
            where u = :user
            order by sr.creationDate desc
            """)
    List<SongReviewRow> findRowsByUser(@Param("user") AppUser user, Pageable pageable);

    @Query(value = """
            select sr.id as id,
                   s.id as songId,
                   s.name as songName,
                   u.id as userId,
                   u.username as username,
                   sr.grade as grade,
                   sr.description as description,
                   sr.creationDate as creationDate
            from SongReview sr
            join sr.song s
            join sr.user u
            where s.id = :songId
            """,
            countQuery = """
                    select count(sr)
                    from SongReview sr
                    join sr.song s
                    where s.id = :songId
                    """)
    Page<SongReviewRow> findRowsBySongId(@Param("songId") Long songId, Pageable pageable);

    @Query("""
        select r.song.id as songId,
               avg(r.grade) as average,
               count(r.id) as count
        from SongReview r
        where r.song.id in :songIds
        group by r.song.id
    """)
    List<SongAverageProjection> findAveragesForSongs(@Param("songIds") Iterable<Long> songIds);

    @Query("select avg(r.grade) from SongReview r where r.song.id = :songId")
    Double findAverageForSong(@Param("songId") Long songId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SongReview r WHERE r.song.id = :songId")
    void deleteReviewsBecauseOfDeletedSong(@Param("songId") Long songId);
}
