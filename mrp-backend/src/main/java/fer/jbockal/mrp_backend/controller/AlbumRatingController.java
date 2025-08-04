package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.AlbumRatingRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumRatingResponseDto;
import fer.jbockal.mrp_backend.service.AlbumRatingService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/album-rating")
@AllArgsConstructor
@Slf4j
public class AlbumRatingController {

    private final AlbumRatingService albumRatingService;

    @PostMapping("/create")
    public ResponseEntity<AlbumRatingResponseDto> create(
            @RequestBody AlbumRatingRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        AlbumRatingResponseDto created = albumRatingService.createRating(dto, principal);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AlbumRatingResponseDto> update(
            @PathVariable Long id,
            @RequestBody AlbumRatingRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        AlbumRatingResponseDto updated = albumRatingService.updateRating(id, dto, principal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN"));
        albumRatingService.deleteRating(id, principal, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumRatingResponseDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal
    ) {
        return ResponseEntity.ok(albumRatingService.getById(id, principal));
    }

    @GetMapping("/by-album/{albumId}")
    public ResponseEntity<List<AlbumRatingResponseDto>> listByAlbum(@PathVariable Long albumId) {
        return ResponseEntity.ok(albumRatingService.listByAlbum(albumId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<AlbumRatingResponseDto>> listMine(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(albumRatingService.listByCurrentUser(principal));
    }
}
