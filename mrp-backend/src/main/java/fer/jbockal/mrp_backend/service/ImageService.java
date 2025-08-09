package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.ImageDataDto;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.ArtistRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

@AllArgsConstructor
@Service
public class ImageService {

    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    // Set true to return a placeholder image instead of 404 when missing.
    private static final String PLACEHOLDER_PATH = "static/cover-placeholder.png";

    public Optional<ImageDataDto> getSongImage(Long songId) {
        return songRepository.findById(songId)
                .flatMap(song -> coverFromBytes(song.getCover()))
                .or(this::placeholderIfEnabled);
    }

    public Optional<ImageDataDto> getAlbumImage(Long albumId) {
        return albumRepository.findById(albumId)
                .flatMap(album -> coverFromBytes(album.getCover()))
                .or(this::placeholderIfEnabled);
    }

    public Optional<ImageDataDto> getArtistImage(Long artistId) {
        return artistRepository.findById(artistId)
                .flatMap(album -> coverFromBytes(album.getImage()))
                .or(this::placeholderIfEnabled);
    }

    private Optional<ImageDataDto> coverFromBytes(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return Optional.empty();
        return Optional.of(new ImageDataDto(bytes, detectMediaType(bytes)));
    }

    private Optional<ImageDataDto> placeholderIfEnabled() {
        try (InputStream in = new ClassPathResource(PLACEHOLDER_PATH).getInputStream()) {
            return Optional.of(new ImageDataDto(in.readAllBytes(), MediaType.IMAGE_PNG));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    /**
     * Lightweight magic-number detection:
     * - PNG 89 50 4E 47 0D 0A 1A 0A
     * - JPEG FF D8 FF
     * - GIF 47 49 46 38
     * Fallback: image/jpeg
     */
    private MediaType detectMediaType(byte[] bytes) {
        if (bytes.length >= 8 &&
                bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E &&
                bytes[3] == 0x47 && bytes[4] == 0x0D && bytes[5] == 0x0A &&
                bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return MediaType.IMAGE_PNG;
        }
        if (bytes.length >= 3 &&
                bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return MediaType.IMAGE_JPEG;
        }
        if (bytes.length >= 4 &&
                bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38) {
            return MediaType.IMAGE_GIF;
        }
        return MediaType.IMAGE_JPEG;
    }
}
