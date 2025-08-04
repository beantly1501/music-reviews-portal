package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.GenreRequestDto;
import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.GenreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    public Genre findById(long id) {
        return genreRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public List<Genre> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return genreRepository.findByNameContainingIgnoreCase(fragment);
    }

    public List<Genre> findAll() {
        return genreRepository.findAll();
    }

    public Genre createGenre(GenreRequestDto dto) {
        Genre g = new Genre();
        g.setName(dto.getName());
        return genreRepository.save(g);
    }

    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + id));

        // detach from songs, so they don't have an id which points to nothing
        for (Song s : genre.getSongs()) {
            s.getGenres().remove(genre);
        }
        genre.getSongs().clear();

        genreRepository.deleteById(id);
    }

}
