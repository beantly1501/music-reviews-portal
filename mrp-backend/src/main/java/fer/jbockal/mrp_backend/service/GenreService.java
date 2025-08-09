package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.genre.GenreRequestDto;
import fer.jbockal.mrp_backend.dto.genre.GenreResponseDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.GenreRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.projection.GenreBaseRow;
import fer.jbockal.mrp_backend.repository.projection.GenreSongRow;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static java.util.stream.Collectors.*;

@Service
public class GenreService {

    private final GenreRepository genreRepository;
    private final SongRepository songRepository;

    public GenreService(GenreRepository genreRepository, SongRepository songRepository) {
        this.genreRepository = genreRepository;
        this.songRepository = songRepository;
    }

    // -------- READ --------

    @Transactional(readOnly = true)
    public List<GenreResponseDto> getAllGenres() {
        var base = genreRepository.findAllBase();
        return assembleDtos(base);
    }

    @Transactional(readOnly = true)
    public List<GenreResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) return List.of();
        var base = genreRepository.findBaseByNameFragment(fragment);
        return assembleDtos(base);
    }

    @Transactional(readOnly = true)
    public GenreResponseDto findById(Long id) {
        GenreBaseRow row = genreRepository.findBaseById(id);
        if (row == null) throw new IllegalArgumentException("Genre not found: " + id);
        return assembleDtos(List.of(row)).get(0);
    }

    // -------- WRITE --------

    @Transactional
    public GenreResponseDto createGenre(GenreRequestDto req) {
        Genre g = new Genre();
        g.setName(req.getName());

        if (req.getSongIds() != null) {
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                g.getSongs().add(s);
                s.getGenres().add(g);
            }
        }

        Genre saved = genreRepository.save(g);
        return findById(saved.getId());
    }

    @Transactional
    public GenreResponseDto updateGenre(Long id, GenreRequestDto req) {
        Genre existing = genreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + id));

        if (req.getName() != null) existing.setName(req.getName());

        if (req.getSongIds() != null) {
            // reset associations
            existing.getSongs().forEach(s -> s.getGenres().remove(existing));
            existing.getSongs().clear();
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                existing.getSongs().add(s);
                s.getGenres().add(existing);
            }
        }

        genreRepository.save(existing);
        return findById(existing.getId());
    }

    @Transactional
    public void deleteGenre(Long id) {
        Genre g = genreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + id));

        g.getSongs().forEach(s -> s.getGenres().remove(g));
        g.getSongs().clear();

        genreRepository.delete(g);
    }

    // -------- DTO assembly (batched) --------

    private List<GenreResponseDto> assembleDtos(List<GenreBaseRow> base) {
        if (base == null || base.isEmpty()) return List.of();

        var ids = base.stream().map(GenreBaseRow::getId).toList();

        Map<Long, LinkedHashSet<SongPartialDto>> songsByGenre =
                genreRepository.findSongsForGenres(ids).stream()
                        .collect(groupingBy(GenreSongRow::getGenreId, mapping(sr ->
                                new SongPartialDto(
                                        sr.getId(),
                                        sr.getName(),
                                        "/images/song/" + sr.getId(),
                                        "/song/audio-file/" + sr.getId(),
                                        sr.getLink(),
                                        sr.getYear()
                                ), toCollection(LinkedHashSet::new))));

        List<GenreResponseDto> out = new ArrayList<>(base.size());
        for (var row : base) {
            Long id = row.getId();
            out.add(new GenreResponseDto(
                    id,
                    row.getName(),
                    emptyToNull(songsByGenre.get(id))
            ));
        }
        return out;
    }

    private static <T> Set<T> emptyToNull(Set<T> set) {
        return (set == null || set.isEmpty()) ? null : set;
    }
}
