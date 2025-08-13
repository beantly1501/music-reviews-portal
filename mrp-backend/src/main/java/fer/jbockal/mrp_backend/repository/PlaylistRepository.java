package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.Playlist;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.projection.PlaylistRow;
import fer.jbockal.mrp_backend.repository.projection.PlaylistSongRow;
import fer.jbockal.mrp_backend.repository.projection.PlaylistCollaboratorRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    @Query("""
            select p.id as id,
                   p.name as name,
                   p.description as description,
                   p.isPrivate as isPrivate,
                   o.username as ownerUsername,
                   (select count(s2.id) from Playlist p2 join p2.songs s2 where p2.id = p.id) as songsCount,
                   (select count(u2.id) from Playlist p3 join p3.collaborators u2 where p3.id = p.id) as collaboratorsCount
            from Playlist p
            join p.owner o
            order by p.id desc
            """)
    List<PlaylistRow> findAllRows(Pageable pageable);

    @Query("""
            select p.id as id,
                   p.name as name,
                   p.description as description,
                   p.isPrivate as isPrivate,
                   o.username as ownerUsername,
                   (select count(s2.id) from Playlist p2 join p2.songs s2 where p2.id = p.id) as songsCount,
                   (select count(u2.id) from Playlist p3 join p3.collaborators u2 where p3.id = p.id) as collaboratorsCount
            from Playlist p
            join p.owner o
            where p.isPrivate = false
            order by p.id desc
            """)
    List<PlaylistRow> findPublicRows(Pageable pageable);

    @Query("""
            select p.id as id,
                   p.name as name,
                   p.description as description,
                   p.isPrivate as isPrivate,
                   o.username as ownerUsername,
                   (select count(s2.id) from Playlist p2 join p2.songs s2 where p2.id = p.id) as songsCount,
                   (select count(u2.id) from Playlist p3 join p3.collaborators u2 where p3.id = p.id) as collaboratorsCount
            from Playlist p
            join p.owner o
            where (o = :user or :user member of p.collaborators)
            order by p.id desc
            """)
    List<PlaylistRow> findRowsForUser(@Param("user") AppUser user, Pageable pageable);

    @Query("""
            select p.id as playlistId, s.id as id, s.name as name, s.link as link, s.year as year
            from Playlist p
            join p.songs s
            where p.id in :ids
            order by p.id, s.id
            """)
    List<PlaylistSongRow> findSongsForPlaylists(@Param("ids") java.util.List<Long> ids);

    @Query("""
            select p.id as playlistId, u.id as id, u.username as username
            from Playlist p
            join p.collaborators u
            where p.id in :ids
            order by p.id, u.id
            """)
    List<PlaylistCollaboratorRow> findCollaboratorsForPlaylists(@Param("ids") java.util.List<Long> ids);

    @Query("""
            select p.id as playlistId, u.id as id, u.username as username
            from Playlist p
            join p.lastEditedBy u
            where p.id in :ids
            order by p.id
            """)
    List<PlaylistCollaboratorRow> findEditorsForPlaylists(@Param("ids") java.util.List<Long> ids);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM playlist_song WHERE song_id = :songId", nativeQuery = true)
    void unlinkSongFromAllPlaylists(@Param("songId") Long songId);
}
