package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.repository.projection.GenreBaseRow;
import fer.jbockal.mrp_backend.repository.projection.GenreSongRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {

    // ---- Base (lean) rows ----

    @Query(value = """
                select g.id as id, g.name as name
                from genre g
                order by g.id
            """, nativeQuery = true)
    List<GenreBaseRow> findAllBase();

    @Query(value = """
                select g.id as id, g.name as name
                from genre g
                where lower(g.name) like lower(concat('%', :fragment, '%'))
                order by g.id
            """, nativeQuery = true)
    List<GenreBaseRow> findBaseByNameFragment(@Param("fragment") String fragment);

    @Query(value = """
                select g.id as id, g.name as name
                from genre g
                where g.id = :id
            """, nativeQuery = true)
    GenreBaseRow findBaseById(@Param("id") Long id);

    // ---- Relations (batched; no row explosion) ----

    @Query(value = """
                select sg.genre_id as genreId,
                       s.id as id, s.name as name, s.link as link, s.year as year
                from song_genre sg
                join song s on s.id = sg.song_id
                where sg.genre_id in (:ids)
                order by sg.genre_id, s.id
            """, nativeQuery = true)
    List<GenreSongRow> findSongsForGenres(@Param("ids") List<Long> genreIds);
}
