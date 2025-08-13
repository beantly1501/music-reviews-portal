package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.dto.partial.UserPartialDto;
import fer.jbockal.mrp_backend.dto.playlist.PlaylistRequestDto;
import fer.jbockal.mrp_backend.dto.playlist.PlaylistResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Playlist;
import fer.jbockal.mrp_backend.model.Role;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import fer.jbockal.mrp_backend.repository.PlaylistRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.projection.PlaylistCollaboratorRow;
import fer.jbockal.mrp_backend.repository.projection.PlaylistRow;
import fer.jbockal.mrp_backend.repository.projection.PlaylistSongRow;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.*;

@Service
@AllArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final AppUserRepository appUserRepository;
    private final AppUserService appUserService;

    @Transactional(readOnly = true)
    public PlaylistResponseDto getById(Object principal, Long id) {
        Playlist playlist = checkIsOwnerOrAdmin(principal, id);
        return toDto(playlist);
    }


    // CREATE
    public PlaylistResponseDto create(Object principal, PlaylistRequestDto dto) {
        AppUser owner = appUserService.resolveAppUserFromPrincipal(principal);

        Playlist p = new Playlist();
        p.setName(dto.getName());
        p.setImage(dto.getImage());
        p.setDescription(dto.getDescription());
        p.setPrivate(Boolean.TRUE.equals(dto.getIsPrivate()));
        p.setOwner(owner);
        p.setLastEditedBy(owner);

        if (dto.getSongIds() != null) {
            p.setSongs(fetchSongs(dto.getSongIds()));
        }
        if (dto.getCollaboratorIds() != null) {
            Set<AppUser> collabs = fetchUsers(dto.getCollaboratorIds());
            collabs.removeIf(u -> Objects.equals(u.getId(), owner.getId()));
            p.setCollaborators(collabs);
        }

        p = playlistRepository.save(p);
        return toDto(p);
    }

    // UPDATE
    public PlaylistResponseDto update(Object principal, Long id, PlaylistRequestDto dto) {
        Playlist p = checkIsOwnerOrAdmin(principal, id);

        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getImage() != null) p.setImage(dto.getImage());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getIsPrivate() != null) p.setPrivate(dto.getIsPrivate());
        if (dto.getSongIds() != null) p.setSongs(fetchSongs(dto.getSongIds()));

        if (dto.getCollaboratorIds() != null) {
            Set<AppUser> collabs = fetchUsers(dto.getCollaboratorIds());
            Playlist finalP = p;
            collabs.removeIf(u -> Objects.equals(u.getId(), finalP.getOwner().getId()));
            p.setCollaborators(collabs);
        }

        p.setLastEditedBy(appUserService.resolveAppUserFromPrincipal(principal));
        p = playlistRepository.save(p);
        return toDto(p);
    }

    public void delete(Object principal, Long id) {
        Playlist p = checkIsOwnerOrAdmin(principal, id);
        playlistRepository.delete(p);
    }

    // SONGS
    public PlaylistResponseDto addSongs(Object principal, Long playlistId, List<Long> songIds) {
        Playlist p = checkCanEdit(principal, playlistId);
        if (songIds != null && !songIds.isEmpty()) {
            p.getSongs().addAll(fetchSongs(songIds));
        }
        p.setLastEditedBy(appUserService.resolveAppUserFromPrincipal(principal));
        p = playlistRepository.save(p);
        return toDto(p);
    }

    public PlaylistResponseDto removeSongs(Object principal, Long playlistId, List<Long> songIds) {
        Playlist p = checkCanEdit(principal, playlistId);
        if (songIds != null && !songIds.isEmpty()) {
            Set<Song> toRemove = fetchSongs(songIds);
            p.getSongs().removeAll(toRemove);
        }
        p.setLastEditedBy(appUserService.resolveAppUserFromPrincipal(principal));
        p = playlistRepository.save(p);
        return toDto(p);
    }

    // COLLABORATORS
    public PlaylistResponseDto addCollaborators(Object principal, Long playlistId, List<Long> userIds) {
        Playlist p = checkIsOwnerOrAdmin(principal, playlistId);
        if (userIds != null && !userIds.isEmpty()) {
            Set<AppUser> users = fetchUsers(userIds);
            Playlist finalP = p;
            users.removeIf(u -> Objects.equals(u.getId(), finalP.getOwner().getId()));
            p.getCollaborators().addAll(users);
        }
        p.setLastEditedBy(appUserService.resolveAppUserFromPrincipal(principal));
        p = playlistRepository.save(p);
        return toDto(p);
    }

    public PlaylistResponseDto removeCollaborators(Object principal, Long playlistId, List<Long> userIds) {
        Playlist p = checkIsOwnerOrAdmin(principal, playlistId);
        if (userIds != null && !userIds.isEmpty()) {
            Set<AppUser> users = fetchUsers(userIds);
            p.getCollaborators().removeAll(users);
        }
        p.setLastEditedBy(appUserService.resolveAppUserFromPrincipal(principal));
        p = playlistRepository.save(p);
        return toDto(p);
    }

    // LISTS -> DTOs
    public List<PlaylistResponseDto> listMine(Object principal, int page, int size) {
        AppUser u = appUserService.resolveAppUserFromPrincipal(principal);
        List<PlaylistRow> rows = playlistRepository.findRowsForUser(u, PageRequest.of(page, size));
        return toDtosFromRows(rows);
    }

    public List<PlaylistResponseDto> listPublic(int page, int size) {
        List<PlaylistRow> rows = playlistRepository.findPublicRows(PageRequest.of(page, size));
        return toDtosFromRows(rows);
    }

    public List<PlaylistResponseDto> listAllAsAdmin(Object principal, int page, int size) {
        AppUser u = appUserService.resolveAppUserFromPrincipal(principal);
        if (u.getRole() != Role.ADMIN) throw new SecurityException("Admin required");
        List<PlaylistRow> rows = playlistRepository.findAllRows(PageRequest.of(page, size));
        return toDtosFromRows(rows);
    }

    // ==== helpers ====
    private Set<Song> fetchSongs(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) return new LinkedHashSet<>();
        return new LinkedHashSet<>(songRepository.findAllById(ids));
    }

    private Set<AppUser> fetchUsers(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) return new LinkedHashSet<>();
        return new LinkedHashSet<>(appUserRepository.findAllById(ids));
    }

    private Playlist checkCanEdit(Object principal, Long playlistId) {
        AppUser actor = appUserService.resolveAppUserFromPrincipal(principal);
        Playlist p = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found: " + playlistId));
        if (actor.getRole() == Role.ADMIN) return p;
        if (p.getOwner().getId().equals(actor.getId())) return p;
        boolean collab = p.getCollaborators().stream().anyMatch(u -> u.getId().equals(actor.getId()));
        if (collab) return p;
        throw new SecurityException("Not allowed to modify this playlist");
    }

    private Playlist checkIsOwnerOrAdmin(Object principal, Long playlistId) {
        AppUser actor = appUserService.resolveAppUserFromPrincipal(principal);
        Playlist p = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found: " + playlistId));
        if (actor.getRole() == Role.ADMIN) return p;
        if (p.getOwner().getId().equals(actor.getId())) return p;
        throw new SecurityException("Only owner or admin can perform this action");
    }

    // ----- DTO assembly -----

    private PlaylistResponseDto toDto(Playlist p) {
        Long pid = p.getId();

        var songs = playlistRepository.findSongsForPlaylists(List.of(pid)).stream()
                .map(this::toPartialSong)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        var collabs = playlistRepository.findCollaboratorsForPlaylists(List.of(pid)).stream()
                .map(this::toPartialUser)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        UserPartialDto lastEdited = null;
        if (p.getLastEditedBy() != null) {
            lastEdited = new UserPartialDto(p.getLastEditedBy().getId(), p.getLastEditedBy().getUsername());
        }

        return new PlaylistResponseDto(
                pid,
                p.getName(),
                "/images/playlist/" + pid,
                p.getDescription(),
                p.isPrivate(),
                p.getOwner() != null ? p.getOwner().getUsername() : null,
                p.getCreationDate(),
                lastEdited,
                songs,
                collabs
        );
    }

    private List<PlaylistResponseDto> toDtosFromRows(List<PlaylistRow> rows) {
        if (rows == null || rows.isEmpty()) return List.of();

        List<Long> ids = rows.stream().map(PlaylistRow::getId).toList();

        Map<Long, LinkedHashSet<SongPartialDto>> songsByPlaylist =
                playlistRepository.findSongsForPlaylists(ids).stream()
                        .collect(groupingBy(
                                PlaylistSongRow::getPlaylistId,
                                mapping(this::toPartialSong, toCollection(LinkedHashSet::new))
                        ));

        Map<Long, LinkedHashSet<UserPartialDto>> collabsByPlaylist =
                playlistRepository.findCollaboratorsForPlaylists(ids).stream()
                        .collect(groupingBy(
                                PlaylistCollaboratorRow::getPlaylistId,
                                mapping(this::toPartialUser, toCollection(LinkedHashSet::new))
                        ));

        Map<Long, java.time.LocalDate> createdById =
                playlistRepository.findAllById(ids).stream()
                        .collect(toMap(Playlist::getId, Playlist::getCreationDate));

        // Reuse PlaylistCollaboratorRow projection to fetch lastEditedBy in batch
        Map<Long, UserPartialDto> editorByPlaylist =
                playlistRepository.findEditorsForPlaylists(ids).stream()
                        .collect(toMap(
                                PlaylistCollaboratorRow::getPlaylistId,
                                r -> new UserPartialDto(r.getId(), r.getUsername())
                        ));

        return rows.stream().map(r -> new PlaylistResponseDto(
                r.getId(),
                r.getName(),
                "/images/playlist/" + r.getId(),
                r.getDescription(),
                r.getIsPrivate(),
                r.getOwnerUsername(),
                createdById.get(r.getId()),
                editorByPlaylist.get(r.getId()),
                songsByPlaylist.getOrDefault(r.getId(), new LinkedHashSet<>()),
                collabsByPlaylist.getOrDefault(r.getId(), new LinkedHashSet<>())
        )).toList();
    }

    private SongPartialDto toPartialSong(PlaylistSongRow r) {
        Long id = r.getId();
        return new SongPartialDto(
                id,
                r.getName(),
                "/images/song/" + id,
                "/song/audio-file/" + id,
                r.getLink(),
                r.getYear()
        );
    }

    private UserPartialDto toPartialUser(PlaylistCollaboratorRow r) {
        return new UserPartialDto(r.getId(), r.getUsername());
    }
}
