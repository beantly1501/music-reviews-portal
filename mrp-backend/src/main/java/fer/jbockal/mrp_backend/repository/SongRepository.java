package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.projection.AlbumForSongRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistRow;
import fer.jbockal.mrp_backend.repository.projection.GenreRow;
import fer.jbockal.mrp_backend.repository.projection.SongRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    List<Song> findByNameContainingIgnoreCase(String fragment);

    // --- Fast, blob-free base rows (list & single) ---

    @Query(value = """
                select s.id as id, s.name as name, s.link as link, s.year as year
                from song s
                order by s.id
            """, nativeQuery = true)
    List<SongRow> findAllBase();

    @Query(value = """
                select s.id as id, s.name as name, s.link as link, s.year as year
                from song s
                where lower(s.name) like lower(concat('%', :fragment, '%'))
                order by s.id
            """, nativeQuery = true)
    List<SongRow> findBaseByNameFragment(@Param("fragment") String fragment);

    @Query(value = """
                select s.id as id, s.name as name, s.link as link, s.year as year
                from song s
                where s.id = :id
            """, nativeQuery = true)
    SongRow findBaseById(@Param("id") Long id);

    // --- Batch relations (no row explosion) ---

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

    // --- Stream blobs without loading the whole entity graph ---

    @Query("select s.cover from Song s where s.id = :id")
    byte[] findCoverById(@Param("id") Long id);

    @Query("select s.file from Song s where s.id = :id")
    byte[] findFileById(@Param("id") Long id);
}
