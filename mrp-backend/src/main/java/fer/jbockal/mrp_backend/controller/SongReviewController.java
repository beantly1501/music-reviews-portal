package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.review.SongReviewRequestDto;
import fer.jbockal.mrp_backend.dto.review.SongReviewResponseDto;
import fer.jbockal.mrp_backend.service.SongReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/song-review")
@AllArgsConstructor
@Slf4j
public class SongReviewController {

    private final SongReviewService songReviewService;

    @PostMapping("/create")
    public ResponseEntity<SongReviewResponseDto> create(
            @RequestBody SongReviewRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        SongReviewResponseDto created = songReviewService.createReview(dto, principal);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SongReviewResponseDto> update(
            @PathVariable Long id,
            @RequestBody SongReviewRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        SongReviewResponseDto updated = songReviewService.updateReview(id, dto, principal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal // using Spring Security user to inspect roles
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN"));
        songReviewService.deleteReview(id, principal, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongReviewResponseDto> getById(@PathVariable Long id,
                                                         @AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(songReviewService.getById(id, principal));
    }

    @GetMapping("/by-song/{songId}")
    public ResponseEntity<List<SongReviewResponseDto>> listBySong(@PathVariable Long songId) {
        return ResponseEntity.ok(songReviewService.listBySong(songId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<SongReviewResponseDto>> listMine(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(songReviewService.listByCurrentUser(principal));
    }
}
