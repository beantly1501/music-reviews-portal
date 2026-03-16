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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
        Playlist playlist = checkCanSeePlaylist(principal, id);
        return toDto(playlist);
    }

    public Page<PlaylistResponseDto> listPublicByUserId(Long userId, Pageable pageable) {
        Page<PlaylistRow> rows = playlistRepository.findPublicRowsByOwnerId(userId, pageable);
        return toDtosFromRows(rows);
    }


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

    public PlaylistResponseDto update(Object principal, Long id, PlaylistRequestDto dto) {
//        Playlist p = checkIsOwnerOrAdmin(principal, id);
        Playlist p = playlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found: " + id));

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

    public Page<PlaylistResponseDto> listMine(Object principal, Pageable pageable) {
        AppUser u = appUserService.resolveAppUserFromPrincipal(principal);
        Page<PlaylistRow> rows = playlistRepository.findRowsForUser(u, pageable);
        return toDtosFromRows(rows);
    }

    public Page<PlaylistResponseDto> listPublic(Pageable pageable) {
        Page<PlaylistRow> rows = playlistRepository.findPublicRows(pageable);
        return toDtosFromRows(rows);
    }

    public Page<PlaylistResponseDto> listPublicAndMine(Object principal, Pageable pageable) {
        AppUser u = appUserService.resolveAppUserFromPrincipal(principal);
        Page<PlaylistRow> rows = playlistRepository.findPublicAndUserRows(u, pageable);
        return toDtosFromRows(rows);
    }

    public Page<PlaylistResponseDto> listAllAsAdmin(Object principal, Pageable pageable) {
        AppUser u = appUserService.resolveAppUserFromPrincipal(principal);
        if (u.getRole() != Role.ADMIN) throw new SecurityException("Admin required");
        Page<PlaylistRow> rows = playlistRepository.findAllRows(pageable);
        return toDtosFromRows(rows);
    }

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

    private Playlist checkCanSeePlaylist(Object principal, Long playlistId) {
        AppUser actor = appUserService.resolveAppUserFromPrincipal(principal);
        Playlist p = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found: " + playlistId));
        if (actor.getRole() == Role.ADMIN) return p;
        if (p.getOwner().getId().equals(actor.getId())) return p;
        if (!p.isPrivate()) return p;
        throw new SecurityException("Only owner or admin can perform this action");
    }


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
                p.getOwner() != null ? p.getOwner().getId() : null,
                p.getOwner() != null ? p.getOwner().getUsername() : null,
                p.getCreationDate(),
                lastEdited,
                songs,
                collabs
        );
    }

    private Page<PlaylistResponseDto> toDtosFromRows(Page<PlaylistRow> page) {
        var rows = page.getContent();
        if (rows == null || rows.isEmpty()) {
            return new PageImpl<>(List.of(), page.getPageable(), page.getTotalElements());
        }

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

        Map<Long, java.time.LocalDate> creationDateById =
                playlistRepository.findAllById(ids).stream()
                        .collect(toMap(Playlist::getId, Playlist::getCreationDate));

        Map<Long, UserPartialDto> editorByPlaylist =
                playlistRepository.findEditorsForPlaylists(ids).stream()
                        .collect(toMap(
                                PlaylistCollaboratorRow::getPlaylistId,
                                r -> new UserPartialDto(r.getId(), r.getUsername())
                        ));

        List<PlaylistResponseDto> dtos = rows.stream().map(r -> new PlaylistResponseDto(
                r.getId(),
                r.getName(),
                "/images/playlist/" + r.getId(),
                r.getDescription(),
                r.getIsPrivate(),
                r.getOwnerId(),
                r.getOwnerUsername(),
                creationDateById.get(r.getId()),
                editorByPlaylist.get(r.getId()),
                songsByPlaylist.getOrDefault(r.getId(), new LinkedHashSet<>()),
                collabsByPlaylist.getOrDefault(r.getId(), new LinkedHashSet<>())
        )).toList();

        return new PageImpl<>(dtos, page.getPageable(), page.getTotalElements());
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
