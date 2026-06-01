package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.repository.projection.ArtistAlbumRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistBaseRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistSongRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {


    @Query(
            value = """
                select ar.id as id, ar.name as name, ar.description as description
                from artist ar
                where (:name is null or lower(ar.name) like lower(concat('%', cast(:name as text), '%')))
                  and (:#{#albumIds == null || #albumIds.isEmpty()} = true
                       or exists (select 1 from album_artist aa where aa.artist_id = ar.id and aa.album_id in (:#{#albumIds ?: 0})))
                  and (:#{#songIds == null || #songIds.isEmpty()} = true
                       or exists (select 1 from song_artist sa where sa.artist_id = ar.id and sa.song_id in (:#{#songIds ?: 0})))
                order by ar.id
            """,
            countQuery = """
                select count(*) from artist ar
                where (:name is null or lower(ar.name) like lower(concat('%', cast(:name as text), '%')))
                  and (:#{#albumIds == null || #albumIds.isEmpty()} = true
                       or exists (select 1 from album_artist aa where aa.artist_id = ar.id and aa.album_id in (:#{#albumIds ?: 0})))
                  and (:#{#songIds == null || #songIds.isEmpty()} = true
                       or exists (select 1 from song_artist sa where sa.artist_id = ar.id and sa.song_id in (:#{#songIds ?: 0})))
            """,
            nativeQuery = true
    )
    Page<ArtistBaseRow> findByFilter(
            @Param("name") String name,
            @Param("albumIds") Collection<Long> albumIds,
            @Param("songIds") Collection<Long> songIds,
            Pageable pageable
    );

    @Query(value = """
                select ar.id as id, ar.name as name, ar.description as description
                from artist ar
                order by ar.id
            """, nativeQuery = true)
    List<ArtistBaseRow> findAllBase();

    @Query(value = """
                select ar.id as id, ar.name as name, ar.description as description
                from artist ar
                where lower(ar.name) like lower(concat('%', :fragment, '%'))
                order by ar.id
            """, nativeQuery = true)
    List<ArtistBaseRow> findBaseByNameFragment(@Param("fragment") String fragment);

    @Query(value = """
                select ar.id as id, ar.name as name, ar.description as description
                from artist ar
                where ar.id = :id
            """, nativeQuery = true)
    ArtistBaseRow findBaseById(@Param("id") Long id);

    // ---- Relations (batched) ----

    @Query(value = """
                select sa.artist_id as artistId, s.id as id, s.name as name, s.link as link, s.year as year
                from song_artist sa
                join song s on s.id = sa.song_id
                where sa.artist_id in (:ids)
                order by sa.artist_id, s.id
            """, nativeQuery = true)
    List<ArtistSongRow> findSongsForArtists(@Param("ids") List<Long> artistIds);

    @Query(value = """
                select aa.artist_id as artistId, a.id as id, a.name as name, a.link as link, a.year as year
                from album_artist aa
                join album a on a.id = aa.album_id
                where aa.artist_id in (:ids)
                order by aa.artist_id, a.id
            """, nativeQuery = true)
    List<ArtistAlbumRow> findAlbumsForArtists(@Param("ids") List<Long> artistIds);

    // ---- Blob field-select (avoid loading entity graph) ----

    @Query("select ar.image from Artist ar where ar.id = :id")
    byte[] findImageById(@Param("id") Long id);
}
