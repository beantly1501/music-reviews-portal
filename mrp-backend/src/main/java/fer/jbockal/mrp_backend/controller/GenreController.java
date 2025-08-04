package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.GenreRequestDto;
import fer.jbockal.mrp_backend.model.Genre;
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

    @GetMapping("/all")
    public ResponseEntity<List<Genre>> listAll() {
        return ResponseEntity.ok(genreService.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Genre>> searchByName(@RequestParam("q") String query) {
        List<Genre> results = genreService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Genre> getById(@PathVariable Long id) {
        return ResponseEntity.ok(genreService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Genre> create(@RequestBody GenreRequestDto dto) {
        Genre created = genreService.createGenre(dto);
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting genre with id {}", id);
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }
}
