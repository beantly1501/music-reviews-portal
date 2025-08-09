package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.genre.GenreRequestDto;
import fer.jbockal.mrp_backend.dto.genre.GenreResponseDto;
import fer.jbockal.mrp_backend.service.GenreService;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/genre", "/genre"})
@AllArgsConstructor
@Slf4j
public class GenreController {

    private final GenreService genreService;

    // READ
    @GetMapping("/all")
    public ResponseEntity<List<GenreResponseDto>> all() {
        return ResponseEntity.ok(genreService.getAllGenres());
    }

    @GetMapping("/search")
    public ResponseEntity<List<GenreResponseDto>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(genreService.searchByNameFragment(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenreResponseDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(genreService.findById(id));
    }

    @PostMapping("/create")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<GenreResponseDto> create(@RequestBody GenreRequestDto body) {
        return ResponseEntity.ok(genreService.createGenre(body));
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<GenreResponseDto> update(@PathVariable Long id, @RequestBody GenreRequestDto body) {
        return ResponseEntity.ok(genreService.updateGenre(id, body));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }
}
