// AlbumRepository.java
package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.repository.projection.AlbumArtistRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumGenreRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumSongRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {


    @Query(
            value = """
                select a.id as id, a.name as name, a.link as link, a.year as year
                from album a
                order by a.id
            """,
            countQuery = """
                select count(*) from album a
            """,
            nativeQuery = true
    )
    Page<AlbumRow> findAllBase(Pageable pageable);

    @Query(
            value = """
                select a.id as id, a.name as name, a.link as link, a.year as year
                from album a
                where lower(a.name) like lower(concat('%', :fragment, '%'))
                order by a.id
            """,
            countQuery = """
                select count(*) from album a
                where lower(a.name) like lower(concat('%', :fragment, '%'))
            """,
            nativeQuery = true
    )
    Page<AlbumRow> findBaseByNameFragment(@Param("fragment") String fragment, Pageable pageable);

    @Query(value = """
                select a.id as id, a.name as name, a.link as link, a.year as year
                from album a
                where a.id = :id
            """, nativeQuery = true)
    AlbumRow findBaseById(@Param("id") Long id);

    // ---- Relations (batched, no row explosion) ----

    @Query(value = """
                select sa.album_id as albumId, s.id as id, s.name as name, s.link as link, s.year as year
                from song_album sa
                join song s on s.id = sa.song_id
                where sa.album_id in (:ids)
                order by sa.album_id, s.id
            """, nativeQuery = true)
    List<AlbumSongRow> findSongsForAlbums(@Param("ids") List<Long> albumIds);

    @Query(value = """
                select aa.album_id as albumId, ar.id as id, ar.name as name, ar.description as description
                from album_artist aa
                join artist ar on ar.id = aa.artist_id
                where aa.album_id in (:ids)
                order by aa.album_id, ar.id
            """, nativeQuery = true)
    List<AlbumArtistRow> findArtistsForAlbums(@Param("ids") List<Long> albumIds);

    // ---- Blob field-select (avoid loading entity graph) ----

    @Query("select a.cover from Album a where a.id = :id")
    byte[] findCoverById(@Param("id") Long id);

    @Query(value = """
            select sa.album_id as albumId, g.id as id, g.name as name
            from song_album sa
            join song_genre sg on sg.song_id = sa.song_id
            join genre g on g.id = sg.genre_id
            where sa.album_id in (:ids)
            group by sa.album_id, g.id, g.name
            order by sa.album_id, g.id
            """, nativeQuery = true)
    List<AlbumGenreRow> findGenresForAlbums(@Param("ids") List<Long> albumIds);

}
