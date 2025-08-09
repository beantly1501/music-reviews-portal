package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumResponseDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.ArtistRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumReviewRepository albumReviewRepository;

    /**
     * Search albums by name fragment and map to response DTOs (reviewed=false).
     */
    public List<AlbumResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return albumRepository
                .findByNameContainingIgnoreCase(fragment)
                .stream()
                .map(album -> toDto(album, false))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all albums with user's review status.
     */
    public List<AlbumResponseDto> getAllAlbumsWithReviewed(AppUser user) {
        List<Album> albums = albumRepository.findAll();
        Set<Long> reviewedAlbumIds = albumReviewRepository
                .findByUser(user)
                .stream()
                .map(ar -> ar.getAlbum().getId())
                .collect(Collectors.toSet());

        return albums.stream()
                .map(album -> toDto(album, reviewedAlbumIds.contains(album.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Create a new album and map to response DTO.
     */
    public AlbumResponseDto createAlbum(AlbumRequestDto albumRequest) {
        Album a = new Album();
        a.setName(albumRequest.getName());
        if (albumRequest.getYear() != null) a.setYear(albumRequest.getYear());
        if (albumRequest.getCover() != null) a.setCover(albumRequest.getCover());
        if (albumRequest.getLink() != null) a.setLink(albumRequest.getLink());

        if (albumRequest.getSongIds() != null) {
            for (Long sid : albumRequest.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                a.getSongs().add(s);
                s.getAlbums().add(a);
            }
        }
        if (albumRequest.getArtistIds() != null) {
            for (Long aid : albumRequest.getArtistIds()) {
                Artist artist = artistRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + aid));
                a.getArtists().add(artist);
                artist.getAlbums().add(a);
            }
        }

        Album saved = albumRepository.save(a);
        return toDto(saved, false);
    }

    /**
     * Update an existing Album entity and map to response DTO.
     * Uses the passed-in Album object's collections as stubs for IDs.
     */
    public AlbumResponseDto updateAlbum(Album albumRequest) {
        if (albumRequest.getId() == null) {
            throw new IllegalArgumentException("Album ID is required for update");
        }
        Album existing = albumRepository.findById(albumRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Album not found: " + albumRequest.getId()));

        if (albumRequest.getName() != null) existing.setName(albumRequest.getName());
        if (albumRequest.getYear() != null) existing.setYear(albumRequest.getYear());
        if (albumRequest.getLink() != null) existing.setLink(albumRequest.getLink());
        if (albumRequest.getCover() != null) existing.setCover(albumRequest.getCover());

        // replace songs if provided
        if (albumRequest.getSongs() != null) {
            existing.getSongs().forEach(s -> s.getAlbums().remove(existing));
            existing.getSongs().clear();
            for (Song stub : albumRequest.getSongs()) {
                if (stub.getId() == null) continue;
                Song s = songRepository.findById(stub.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + stub.getId()));
                existing.getSongs().add(s);
                s.getAlbums().add(existing);
            }
        }
        // replace artists if provided
        if (albumRequest.getArtists() != null) {
            existing.getArtists().forEach(ar -> ar.getAlbums().remove(existing));
            existing.getArtists().clear();
            for (Artist stub : albumRequest.getArtists()) {
                if (stub.getId() == null) continue;
                Artist art = artistRepository.findById(stub.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + stub.getId()));
                existing.getArtists().add(art);
                art.getAlbums().add(existing);
            }
        }

        Album updated = albumRepository.save(existing);
        return toDto(updated, false);
    }

    /**
     * Delete an album, removing bidirectional links.
     */
    public void deleteAlbum(Long id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));

        album.getSongs().forEach(s -> s.getAlbums().remove(album));
        album.getSongs().clear();
        album.getArtists().forEach(a -> a.getAlbums().remove(album));
        album.getArtists().clear();

        albumRepository.delete(album);
    }

    /**
     * Helper to map Album entity to AlbumResponseDto.
     */
    private AlbumResponseDto toDto(Album album, boolean reviewed) {
        Set<SongPartialDto> songs = album.getSongs().stream()
                .map(s -> {
                    String imageUrl = "/images/song/" + s.getId();
                    String fileUrl = "/song/audio-file/" + s.getId();

                    return new SongPartialDto(s.getId(), s.getName(), imageUrl, s.getLink(), fileUrl, s.getYear());
                })
                .collect(Collectors.toSet());
        Set<ArtistPartialDto> artists = album.getArtists().stream()
                .map(ar -> {
                    String imageUrl = "/images/artist/" + ar.getId();
                    return new ArtistPartialDto(ar.getId(), ar.getName(), imageUrl, ar.getDescription());
                })
                .collect(Collectors.toSet());

        songs = songs.isEmpty() ? null : songs;
        artists = artists.isEmpty() ? null : artists;

        String imageUrl = "/images/song/" + album.getId();

        return new AlbumResponseDto(
                album.getId(),
                album.getName(),
                imageUrl,
                album.getLink(),
                album.getYear(),
                songs,
                artists,
                reviewed
        );
    }
}