package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.SongReviewComment;
import fer.jbockal.mrp_backend.repository.projection.SongReviewCommentRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface SongReviewCommentRepository extends JpaRepository<SongReviewComment, Long> {

    Optional<SongReviewComment> findByIdAndUser(Long id, AppUser user);

    @Query(value = """
            select c.id as id,
                   r.id as reviewId,
                   u.id as userId,
                   u.username as username,
                   c.content as content,
                   c.creationDate as creationDate,
                   c.updatedDate as updatedDate
            from SongReviewComment c
            join c.review r
            join c.user u
            where r.id = :reviewId
            """,
            countQuery = """
                    select count(c)
                    from SongReviewComment c
                    join c.review r
                    where r.id = :reviewId
                    """)
    Page<SongReviewCommentRow> findRowsByReviewId(@Param("reviewId") Long reviewId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM SongReviewComment c WHERE c.review.id = :reviewId")
    void deleteByReviewId(@Param("reviewId") Long reviewId);
}
