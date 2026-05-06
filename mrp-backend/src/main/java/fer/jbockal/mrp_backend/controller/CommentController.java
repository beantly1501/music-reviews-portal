package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.comment.CommentRequestDto;
import fer.jbockal.mrp_backend.dto.comment.CommentResponseDto;
import fer.jbockal.mrp_backend.service.CommentService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/comments", "/comments"})
@AllArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/song/{reviewId}")
    public ResponseEntity<Page<CommentResponseDto>> getSongReviewComments(
            @PathVariable Long reviewId,
            @PageableDefault(size = 20, sort = "creationDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(commentService.getSongReviewComments(reviewId, pageable));
    }

    @GetMapping("/album/{reviewId}")
    public ResponseEntity<Page<CommentResponseDto>> getAlbumReviewComments(
            @PathVariable Long reviewId,
            @PageableDefault(size = 20, sort = "creationDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(commentService.getAlbumReviewComments(reviewId, pageable));
    }

    @PostMapping("/song/{reviewId}")
    public ResponseEntity<CommentResponseDto> createSongReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long reviewId,
            @RequestBody CommentRequestDto dto
    ) {
        return ResponseEntity.ok(commentService.createSongReviewComment(principal, reviewId, dto));
    }

    @PostMapping("/album/{reviewId}")
    public ResponseEntity<CommentResponseDto> createAlbumReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long reviewId,
            @RequestBody CommentRequestDto dto
    ) {
        return ResponseEntity.ok(commentService.createAlbumReviewComment(principal, reviewId, dto));
    }

    @PutMapping("/song/{commentId}")
    public ResponseEntity<CommentResponseDto> updateSongReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long commentId,
            @RequestBody CommentRequestDto dto
    ) {
        return ResponseEntity.ok(commentService.updateSongReviewComment(principal, commentId, dto));
    }

    @PutMapping("/album/{commentId}")
    public ResponseEntity<CommentResponseDto> updateAlbumReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long commentId,
            @RequestBody CommentRequestDto dto
    ) {
        return ResponseEntity.ok(commentService.updateAlbumReviewComment(principal, commentId, dto));
    }

    @DeleteMapping("/song/{commentId}")
    public ResponseEntity<Void> deleteSongReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long commentId
    ) {
        commentService.deleteSongReviewComment(principal, commentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/album/{commentId}")
    public ResponseEntity<Void> deleteAlbumReviewComment(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long commentId
    ) {
        commentService.deleteAlbumReviewComment(principal, commentId);
        return ResponseEntity.noContent().build();
    }
}
