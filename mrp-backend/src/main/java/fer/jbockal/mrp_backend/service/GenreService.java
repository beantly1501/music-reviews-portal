package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.GenreRequestDto;
import fer.jbockal.mrp_backend.dto.GenreResponseDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.GenreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    /**
     * Find a genre by ID and map to DTO including its songs.
     */
    public GenreResponseDto findById(long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Genre not found: " + id));
        return toDto(genre);
    }

    /**
     * Search genres by name fragment (case-insensitive) and map to DTOs.
     */
    public List<GenreResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return genreRepository.findByNameContainingIgnoreCase(fragment)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve all genres and map to DTOs.
     */
    public List<GenreResponseDto> findAll() {
        return genreRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new genre from the request DTO and map to response DTO.
     */
    public GenreResponseDto createGenre(GenreRequestDto dto) {
        Genre g = new Genre();
        g.setName(dto.getName());
        Genre saved = genreRepository.save(g);
        return toDto(saved);
    }

    /**
     * Delete a genre by ID, removing references from songs.
     */
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + id));

        // detach from songs
        for (Song s : genre.getSongs()) {
            s.getGenres().remove(genre);
        }
        genre.getSongs().clear();

        genreRepository.deleteById(id);
    }

    /**
     * Helper to map Genre entity to Response DTO, including nested SongPartialDto set.
     */

    private GenreResponseDto toDto(Genre genre) {
        Set<SongPartialDto> songs = genre.getSongs().stream()
                .map(s -> {
                    String imageUrl = "/images/song/" + s.getId();
                    String fileUrl = "/song/audio-file/" + s.getId();
                    return new SongPartialDto(
                            s.getId(),
                            s.getName(),
                            imageUrl,
                            s.getLink(),
                            fileUrl,
                            s.getYear()
                    );
                })
                .collect(Collectors.toSet());

        songs = songs.isEmpty() ? null : songs;
        return new GenreResponseDto(
                genre.getId(),
                genre.getName(),
                songs
        );
    }
}