package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.comment.CommentRequestDto;
import fer.jbockal.mrp_backend.dto.comment.CommentResponseDto;
import fer.jbockal.mrp_backend.model.*;
import fer.jbockal.mrp_backend.repository.AlbumReviewCommentRepository;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.SongReviewCommentRepository;
import fer.jbockal.mrp_backend.repository.SongReviewRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class CommentService {

    private final SongReviewCommentRepository songCommentRepository;
    private final AlbumReviewCommentRepository albumCommentRepository;
    private final SongReviewRepository songReviewRepository;
    private final AlbumReviewRepository albumReviewRepository;
    private final AppUserService appUserService;

    public Page<CommentResponseDto> getSongReviewComments(Long reviewId, Pageable pageable) {
        if (!songReviewRepository.existsById(reviewId)) {
            throw new IllegalArgumentException("Song review not found: " + reviewId);
        }
        Pageable effective = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "creationDate"))
                : pageable;
        return songCommentRepository.findRowsByReviewId(reviewId, effective)
                .map(r -> new CommentResponseDto(r.getId(), r.getReviewId(), r.getUserId(), r.getUsername(),
                        r.getContent(), r.getCreationDate(), r.getUpdatedDate()));
    }

    public Page<CommentResponseDto> getAlbumReviewComments(Long reviewId, Pageable pageable) {
        if (!albumReviewRepository.existsById(reviewId)) {
            throw new IllegalArgumentException("Album review not found: " + reviewId);
        }
        Pageable effective = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "creationDate"))
                : pageable;
        return albumCommentRepository.findRowsByReviewId(reviewId, effective)
                .map(r -> new CommentResponseDto(r.getId(), r.getReviewId(), r.getUserId(), r.getUsername(),
                        r.getContent(), r.getCreationDate(), r.getUpdatedDate()));
    }

    public CommentResponseDto createSongReviewComment(Object principal, Long reviewId, CommentRequestDto dto) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongReview review = songReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Song review not found: " + reviewId));
        SongReviewComment comment = new SongReviewComment(null, review, user, dto.getContent(), LocalDateTime.now(), null);
        songCommentRepository.save(comment);
        return new CommentResponseDto(comment.getId(), reviewId, user.getId(), user.getUsername(),
                comment.getContent(), comment.getCreationDate(), null);
    }

    public CommentResponseDto createAlbumReviewComment(Object principal, Long reviewId, CommentRequestDto dto) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        AlbumReview review = albumReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Album review not found: " + reviewId));
        AlbumReviewComment comment = new AlbumReviewComment(null, review, user, dto.getContent(), LocalDateTime.now(), null);
        albumCommentRepository.save(comment);
        return new CommentResponseDto(comment.getId(), reviewId, user.getId(), user.getUsername(),
                comment.getContent(), comment.getCreationDate(), null);
    }

    public CommentResponseDto updateSongReviewComment(Object principal, Long commentId, CommentRequestDto dto) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongReviewComment comment = songCommentRepository.findByIdAndUser(commentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found or not owned: " + commentId));
        comment.setContent(dto.getContent());
        comment.setUpdatedDate(LocalDateTime.now());
        songCommentRepository.save(comment);
        return new CommentResponseDto(comment.getId(), comment.getReview().getId(), user.getId(), user.getUsername(),
                comment.getContent(), comment.getCreationDate(), comment.getUpdatedDate());
    }

    public CommentResponseDto updateAlbumReviewComment(Object principal, Long commentId, CommentRequestDto dto) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        AlbumReviewComment comment = albumCommentRepository.findByIdAndUser(commentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found or not owned: " + commentId));
        comment.setContent(dto.getContent());
        comment.setUpdatedDate(LocalDateTime.now());
        albumCommentRepository.save(comment);
        return new CommentResponseDto(comment.getId(), comment.getReview().getId(), user.getId(), user.getUsername(),
                comment.getContent(), comment.getCreationDate(), comment.getUpdatedDate());
    }

    public void deleteSongReviewComment(Object principal, Long commentId) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        if (user.getRole() == Role.ADMIN) {
            songCommentRepository.deleteById(commentId);
        } else {
            SongReviewComment comment = songCommentRepository.findByIdAndUser(commentId, user)
                    .orElseThrow(() -> new IllegalArgumentException("Comment not found or not owned: " + commentId));
            songCommentRepository.delete(comment);
        }
    }

    public void deleteAlbumReviewComment(Object principal, Long commentId) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        if (user.getRole() == Role.ADMIN) {
            albumCommentRepository.deleteById(commentId);
        } else {
            AlbumReviewComment comment = albumCommentRepository.findByIdAndUser(commentId, user)
                    .orElseThrow(() -> new IllegalArgumentException("Comment not found or not owned: " + commentId));
            albumCommentRepository.delete(comment);
        }
    }
}
