package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.review.*;
import fer.jbockal.mrp_backend.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@AllArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDto>> getAll() {
        List<ReviewResponseDto> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponseDto>> getByUser(
            @PathVariable Long userId,
            @RequestParam(value = "count", required = false) Integer count
    ) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByUserId(userId, count);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/newest")
    public ResponseEntity<List<ReviewResponseDto>> newest(@RequestParam(name = "count", defaultValue = "20") int count) {
        if (count <= 0) return ResponseEntity.badRequest().build();
        List<ReviewResponseDto> reviews = reviewService.getNewestReviews(count);

        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ReviewResponseDto>> mine(
            @AuthenticationPrincipal Object principal,
            @RequestParam(name = "count", required = false) Integer count
    ) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByCurrentUser(principal, count);
        return ResponseEntity.ok(reviews);
    }

    // ==== SONG REVIEW endpoints ====
    @GetMapping("/song/{id}")
    public ResponseEntity<SongReviewResponseDto> getSongReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getSongReview(id));
    }

    @GetMapping("/song/all/{songId}")
    public ResponseEntity<Page<SongReviewResponseDto>> getAllSongReviews(
            @PathVariable Long songId,
            @PageableDefault(size = 20, sort = "creationDate", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getSongReviewsBySong(songId, pageable));
    }

    @PostMapping("/song/create")
    public ResponseEntity<SongReviewResponseDto> createSongReview(
            @AuthenticationPrincipal Object principal,
            @RequestBody SongReviewRequestDto dto
    ) {
        return ResponseEntity.ok(reviewService.createSongReview(principal, dto));
    }

    @PutMapping("/song/update/{id}")
    public ResponseEntity<SongReviewResponseDto> updateSongReview(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody SongReviewRequestDto dto
    ) {
        return ResponseEntity.ok(reviewService.updateSongReview(principal, id, dto));
    }

    @DeleteMapping("/song/delete/{id}")
    public ResponseEntity<Void> deleteSongReview(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id
    ) {
        reviewService.deleteSongReview(principal, id);
        return ResponseEntity.noContent().build();
    }

    // ==== ALBUM REVIEW endpoints ====
    @GetMapping("/album/{id}")
    public ResponseEntity<AlbumReviewResponseDto> getAlbumReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getAlbumReview(id));
    }

    @GetMapping("/album/all/{albumId}")
    public ResponseEntity<Page<AlbumReviewResponseDto>> getAllAlbumReviews(
            @PathVariable Long albumId,
            @PageableDefault(size = 20, sort = "creationDate", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getAlbumReviewsByAlbum(albumId, pageable));
    }

    @PostMapping("/album/create")
    public ResponseEntity<AlbumReviewResponseDto> createAlbumReview(
            @AuthenticationPrincipal Object principal,
            @RequestBody AlbumReviewRequestDto dto
    ) {
        return ResponseEntity.ok(reviewService.createAlbumReview(principal, dto));
    }

    @PutMapping("/album/update/{id}")
    public ResponseEntity<AlbumReviewResponseDto> updateAlbumReview(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody AlbumReviewRequestDto dto
    ) {
        return ResponseEntity.ok(reviewService.updateAlbumReview(principal, id, dto));
    }

    @DeleteMapping("/album/delete/{id}")
    public ResponseEntity<Void> deleteAlbumReview(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id
    ) {
        reviewService.deleteAlbumReview(principal, id);
        return ResponseEntity.noContent().build();
    }
}
