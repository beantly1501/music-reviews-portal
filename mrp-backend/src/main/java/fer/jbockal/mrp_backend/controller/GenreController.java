package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.genre.GenreRequestDto;
import fer.jbockal.mrp_backend.dto.genre.GenreResponseDto;
import fer.jbockal.mrp_backend.service.GenreService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/genre")
@AllArgsConstructor
@Slf4j
public class GenreController {

    private final GenreService genreService;

    /**
     * Retrieve all genres.
     */
    @GetMapping("/all")
    public ResponseEntity<List<GenreResponseDto>> listAll() {
        return ResponseEntity.ok(genreService.findAll());
    }

    /**
     * Search genres by name fragment.
     */
    @GetMapping("/search")
    public ResponseEntity<List<GenreResponseDto>> searchByName(@RequestParam("q") String query) {
        return ResponseEntity.ok(genreService.searchByNameFragment(query));
    }

    /**
     * Get a single genre by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GenreResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(genreService.findById(id));
    }

    /**
     * Create a new genre (ADMIN only).
     */
//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<GenreResponseDto> create(@RequestBody GenreRequestDto dto) {
        GenreResponseDto created = genreService.createGenre(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Delete a genre by ID (ADMIN only).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting genre with id {}", id);
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }
}