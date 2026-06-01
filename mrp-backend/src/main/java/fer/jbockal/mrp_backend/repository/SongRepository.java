package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.projection.AlbumForSongRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistRow;
import fer.jbockal.mrp_backend.repository.projection.GenreRow;
import fer.jbockal.mrp_backend.repository.projection.SongRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    @Query(
            value = """
                select s.id as id, s.name as name, s.link as link, s.year as year
                from song s
                where (:name is null or lower(s.name) like lower(concat('%', cast(:name as text), '%')))
                  and (:#{#genreIds == null || #genreIds.isEmpty()} = true
                       or exists (select 1 from song_genre sg where sg.song_id = s.id and sg.genre_id in (:#{#genreIds ?: 0})))
                  and (:#{#artistIds == null || #artistIds.isEmpty()} = true
                       or exists (select 1 from song_artist sa where sa.song_id = s.id and sa.artist_id in (:#{#artistIds ?: 0})))
                  and (:#{#albumIds == null || #albumIds.isEmpty()} = true
                       or exists (select 1 from song_album sal where sal.song_id = s.id and sal.album_id in (:#{#albumIds ?: 0})))
                order by s.id
            """,
            countQuery = """
                select count(*) from song s
                where (:name is null or lower(s.name) like lower(concat('%', cast(:name as text), '%')))
                  and (:#{#genreIds == null || #genreIds.isEmpty()} = true
                       or exists (select 1 from song_genre sg where sg.song_id = s.id and sg.genre_id in (:#{#genreIds ?: 0})))
                  and (:#{#artistIds == null || #artistIds.isEmpty()} = true
                       or exists (select 1 from song_artist sa where sa.song_id = s.id and sa.artist_id in (:#{#artistIds ?: 0})))
                  and (:#{#albumIds == null || #albumIds.isEmpty()} = true
                       or exists (select 1 from song_album sal where sal.song_id = s.id and sal.album_id in (:#{#albumIds ?: 0})))
            """,
            nativeQuery = true
    )
    Page<SongRow> findByFilter(
            @Param("name") String name,
            @Param("genreIds") Collection<Long> genreIds,
            @Param("artistIds") Collection<Long> artistIds,
            @Param("albumIds") Collection<Long> albumIds,
            Pageable pageable
    );


    @Query(value = """
                select s.id as id, s.name as name, s.link as link, s.year as year
                from song s
                where s.id = :id
            """, nativeQuery = true)
    SongRow findBaseById(@Param("id") Long id);


    @Query(value = """
                select sa.song_id as songId, a.id as id, a.name as name, a.link as link, a.year as year
                from song_album sa
                join album a on a.id = sa.album_id
                where sa.song_id in (:ids)
                order by sa.song_id, a.id
            """, nativeQuery = true)
    List<AlbumForSongRow> findAlbumsForSongs(@Param("ids") List<Long> ids);

    @Query(value = """
                select sar.song_id as songId, ar.id as id, ar.name as name, ar.description as description
                from song_artist sar
                join artist ar on ar.id = sar.artist_id
                where sar.song_id in (:ids)
                order by sar.song_id, ar.id
            """, nativeQuery = true)
    List<ArtistRow> findArtistsForSongs(@Param("ids") List<Long> ids);

    @Query(value = """
                select sg.song_id as songId, g.id as id, g.name as name
                from song_genre sg
                join genre g on g.id = sg.genre_id
                where sg.song_id in (:ids)
                order by sg.song_id, g.id
            """, nativeQuery = true)
    List<GenreRow> findGenresForSongs(@Param("ids") List<Long> ids);


    @Query("select s.cover from Song s where s.id = :id")
    byte[] findCoverById(@Param("id") Long id);

    @Query("select s.file from Song s where s.id = :id")
    byte[] findFileById(@Param("id") Long id);
}
