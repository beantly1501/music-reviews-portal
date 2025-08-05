package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumReviewRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumReviewResponseDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.AlbumReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AlbumReviewService {

    private final AlbumReviewRepository albumReviewRepository;
    private final AlbumRepository albumRepository;
    private final AppUserRepository appUserRepository;

    private AppUser resolveAppUserFromPrincipal(Object principalObj) {
        if (principalObj == null) {
            throw new IllegalArgumentException("Not authenticated");
        }
        String username;
        if (principalObj instanceof User userDetails) {
            username = userDetails.getUsername();
        } else if (principalObj instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            username = ud.getUsername();
        } else if (principalObj instanceof String) {
            username = (String) principalObj;
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " + principalObj.getClass());
        }
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    public AlbumReviewResponseDto getById(Long id, Object principal) {
        AlbumReview review = albumReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + id));
        return toDto(review);
    }

    public List<AlbumReviewResponseDto> listByAlbum(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        return albumReviewRepository.findByAlbum(album).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AlbumReviewResponseDto> listByCurrentUser(Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        return albumReviewRepository.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AlbumReviewResponseDto createReview(AlbumReviewRequestDto dto, Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        Album album = albumRepository.findById(dto.getAlbumId())
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + dto.getAlbumId()));

        AlbumReview review = new AlbumReview();
        review.setAlbum(album);
        review.setUser(user);
        review.setGrade(dto.getGrade());
        review.setDescription(dto.getDescription());
        review.setCreationDate(LocalDate.now());

        AlbumReview saved = albumReviewRepository.save(review);
        return toDto(saved);
    }

    public AlbumReviewResponseDto updateReview(Long id, AlbumReviewRequestDto dto, Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        AlbumReview existing = albumReviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Review not found or not owned by user"));

        if (dto.getGrade() != null) existing.setGrade(dto.getGrade());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        // album and user immutable here

        AlbumReview saved = albumReviewRepository.save(existing);
        return toDto(saved);
    }

    public void deleteReview(Long id, Object principal, boolean isAdmin) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        if (isAdmin) {
            albumReviewRepository.deleteById(id);
            return;
        }
        AlbumReview existing = albumReviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Review not found or not owned by user"));
        albumReviewRepository.delete(existing);
    }

    private AlbumReviewResponseDto toDto(AlbumReview r) {
        return new AlbumReviewResponseDto(
                r.getId(),
                r.getAlbum().getId(),
                r.getUser().getUsername(),
                r.getGrade(),
                r.getDescription(),
                r.getCreationDate()
        );
    }
}
