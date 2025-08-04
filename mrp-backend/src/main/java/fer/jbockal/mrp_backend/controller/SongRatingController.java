package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.SongRatingRequestDto;
import fer.jbockal.mrp_backend.dto.SongRatingResponseDto;
import fer.jbockal.mrp_backend.service.SongRatingService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/song-rating")
@AllArgsConstructor
@Slf4j
public class SongRatingController {

    private final SongRatingService songRatingService;

    @PostMapping("/create")
    public ResponseEntity<SongRatingResponseDto> create(
            @RequestBody SongRatingRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        SongRatingResponseDto created = songRatingService.createRating(dto, principal);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SongRatingResponseDto> update(
            @PathVariable Long id,
            @RequestBody SongRatingRequestDto dto,
            @AuthenticationPrincipal Object principal
    ) {
        SongRatingResponseDto updated = songRatingService.updateRating(id, dto, principal);
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
        songRatingService.deleteRating(id, principal, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongRatingResponseDto> getById(@PathVariable Long id,
                                                         @AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(songRatingService.getById(id, principal));
    }

    @GetMapping("/by-song/{songId}")
    public ResponseEntity<List<SongRatingResponseDto>> listBySong(@PathVariable Long songId) {
        return ResponseEntity.ok(songRatingService.listBySong(songId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<SongRatingResponseDto>> listMine(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(songRatingService.listByCurrentUser(principal));
    }
}
