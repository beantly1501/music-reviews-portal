package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.review.AlbumReviewRequestDto;
import fer.jbockal.mrp_backend.dto.review.AlbumReviewResponseDto;
import fer.jbockal.mrp_backend.service.AlbumReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/album-review")
@AllArgsConstructor
@Slf4j
public class AlbumReviewController {

    private final AlbumReviewService albumReviewService;

    @PostMapping("/create")
    public ResponseEntity<AlbumReviewResponseDto> create(
            @RequestBody AlbumReviewRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        AlbumReviewResponseDto created = albumReviewService.createReview(dto, principal);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AlbumReviewResponseDto> update(
            @PathVariable Long id,
            @RequestBody AlbumReviewRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        AlbumReviewResponseDto updated = albumReviewService.updateReview(id, dto, principal);
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
        albumReviewService.deleteReview(id, principal, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumReviewResponseDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal
    ) {
        return ResponseEntity.ok(albumReviewService.getById(id, principal));
    }

    @GetMapping("/by-album/{albumId}")
    public ResponseEntity<List<AlbumReviewResponseDto>> listByAlbum(@PathVariable Long albumId) {
        return ResponseEntity.ok(albumReviewService.listByAlbum(albumId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<AlbumReviewResponseDto>> listMine(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(albumReviewService.listByCurrentUser(principal));
    }
}
