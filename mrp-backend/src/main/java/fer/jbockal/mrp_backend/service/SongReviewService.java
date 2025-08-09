package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.review.SongReviewRequestDto;
import fer.jbockal.mrp_backend.dto.review.SongReviewResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.model.SongReview;
import fer.jbockal.mrp_backend.repository.SongReviewRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SongReviewService {

    private final SongReviewRepository songReviewRepository;
    private final SongRepository songRepository;
    private final AppUserService appUserService;

    public SongReviewResponseDto getById(Long id, Object principal) {
        SongReview review = songReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + id));
        return toDto(review);
    }

    public List<SongReviewResponseDto> listBySong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + songId));
        return songReviewRepository.findBySong(song).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<SongReviewResponseDto> listByCurrentUser(Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return songReviewRepository.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SongReviewResponseDto createReview(SongReviewRequestDto dto, Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        Song song = songRepository.findById(dto.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + dto.getSongId()));

        SongReview review = new SongReview();
        review.setSong(song);
        review.setUser(user);
        review.setGrade(dto.getGrade());
        review.setDescription(dto.getDescription());
        review.setCreationDate(LocalDate.now());

        SongReview saved = songReviewRepository.save(review);
        return toDto(saved);
    }

    public SongReviewResponseDto updateReview(Long id, SongReviewRequestDto dto, Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        // User can only update their own review
        SongReview existing = songReviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Review not found or not owned by user"));

        if (dto.getGrade() != null) existing.setGrade(dto.getGrade());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        // creationDate and user/song are immutable here

        SongReview saved = songReviewRepository.save(existing);
        return toDto(saved);
    }

    public void deleteReview(Long id, Object principal, boolean isAdmin) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        if (isAdmin) {
            songReviewRepository.deleteById(id);
            return;
        }
        // normal user: only delete own
        SongReview existing = songReviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Review not found or not owned by user"));
        songReviewRepository.delete(existing);
    }

    private SongReviewResponseDto toDto(SongReview r) {
        return new SongReviewResponseDto(
                r.getId(),
                r.getSong().getId(),
                r.getSong().getName(),
                r.getUser().getUsername(),
                r.getGrade(),
                r.getDescription(),
                r.getCreationDate(),
                "/images/song/" + r.getSong().getId()
        );
    }
}
