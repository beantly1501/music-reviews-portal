package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.ArtistRequestDto;
import fer.jbockal.mrp_backend.dto.ArtistResponseDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.repository.ArtistRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;

    /**
     * Retrieve all artists and map to response DTOs.
     */
    public List<ArtistResponseDto> findAll() {
        return artistRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Find artist by ID and map to DTO.
     */
    public ArtistResponseDto findById(long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Artist not found: " + id));
        return toDto(artist);
    }

    /**
     * Search artists by name fragment and map to DTOs.
     */
    public List<ArtistResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return artistRepository.findByNameContainingIgnoreCase(fragment).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new artist and return response DTO.
     */
    public ArtistResponseDto createArtist(ArtistRequestDto dto) {
        Artist artist = new Artist();
        artist.setName(dto.getName());
        artist.setDescription(dto.getDescription());
        if (dto.getImage() != null) {
            artist.setImage(dto.getImage());
        }
        if (dto.getSongIds() != null) {
            for (Long sid : dto.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                artist.getSongs().add(s);
                s.getArtists().add(artist);
            }
        }
        if (dto.getAlbumIds() != null) {
            for (Long aid : dto.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                artist.getAlbums().add(a);
                a.getArtists().add(artist);
            }
        }
        Artist saved = artistRepository.save(artist);
        return toDto(saved);
    }

    /**
     * Update an existing artist entity and return response DTO.
     * Accepts Artist stub with id, new fields, and collections of stubs for songs and albums.
     */
    public ArtistResponseDto updateArtist(Artist artistRequest) {
        if (artistRequest.getId() == null) {
            throw new IllegalArgumentException("Artist ID is required for update");
        }
        Artist existing = artistRepository.findById(artistRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Artist not found: " + artistRequest.getId()));
        // update fields
        if (artistRequest.getName() != null) existing.setName(artistRequest.getName());
        if (artistRequest.getDescription() != null) existing.setDescription(artistRequest.getDescription());
        if (artistRequest.getImage() != null) existing.setImage(artistRequest.getImage());
        // replace songs if provided
        if (artistRequest.getSongs() != null) {
            existing.getSongs().forEach(s -> s.getArtists().remove(existing));
            existing.getSongs().clear();
            for (Song stub : artistRequest.getSongs()) {
                if (stub.getId() == null) continue;
                Song s = songRepository.findById(stub.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + stub.getId()));
                existing.getSongs().add(s);
                s.getArtists().add(existing);
            }
        }
        // replace albums if provided
        if (artistRequest.getAlbums() != null) {
            existing.getAlbums().forEach(a -> a.getArtists().remove(existing));
            existing.getAlbums().clear();
            for (Album stub : artistRequest.getAlbums()) {
                if (stub.getId() == null) continue;
                Album a = albumRepository.findById(stub.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + stub.getId()));
                existing.getAlbums().add(a);
                a.getArtists().add(existing);
            }
        }
        Artist updated = artistRepository.save(existing);
        return toDto(updated);
    }

    /**
     * Delete an artist, removing bidirectional links.
     */
    public void deleteArtist(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + id));
        artist.getSongs().forEach(s -> s.getArtists().remove(artist));
        artist.getSongs().clear();
        artist.getAlbums().forEach(a -> a.getArtists().remove(artist));
        artist.getAlbums().clear();
        artistRepository.delete(artist);
    }

    /**
     * Map Artist entity to response DTO including partial song and album collections.
     */
    private ArtistResponseDto toDto(Artist artist) {
        Set<SongPartialDto> songs = artist.getSongs().stream()
                .map(s -> {
                    String imageUrl = "/images/song/" + s.getId();
                    String fileUrl = "/song/audio-file/" + s.getId();
                    return new SongPartialDto(s.getId(), s.getName(), imageUrl, s.getLink(), fileUrl, s.getYear());
                })
                .collect(Collectors.toSet());

        Set<AlbumPartialDto> albums = artist.getAlbums().stream()
                .map(a -> {
                    String imageUrl = "/images/album/" + a.getId();
                    return new AlbumPartialDto(a.getId(), a.getName(), imageUrl, a.getLink(), a.getYear());
                })
                .collect(Collectors.toSet());

        songs = songs.isEmpty() ? null : songs;
        albums = albums.isEmpty() ? null : albums;

        String imageUrl = "/images/artist/" + artist.getId();

        return new ArtistResponseDto(
                artist.getId(),
                artist.getName(),
                imageUrl,
                artist.getDescription(),
                songs,
                albums
        );
    }
}