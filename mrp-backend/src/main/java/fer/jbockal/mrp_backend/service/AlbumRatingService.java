package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRatingRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumRatingResponseDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.AlbumRating;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.AlbumRatingRepository;
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
public class AlbumRatingService {

    private final AlbumRatingRepository albumRatingRepository;
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

    public AlbumRatingResponseDto getById(Long id, Object principal) {
        AlbumRating rating = albumRatingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found: " + id));
        return toDto(rating);
    }

    public List<AlbumRatingResponseDto> listByAlbum(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        return albumRatingRepository.findByAlbum(album).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AlbumRatingResponseDto> listByCurrentUser(Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        return albumRatingRepository.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AlbumRatingResponseDto createRating(AlbumRatingRequestDto dto, Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        Album album = albumRepository.findById(dto.getAlbumId())
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + dto.getAlbumId()));

        AlbumRating rating = new AlbumRating();
        rating.setAlbum(album);
        rating.setUser(user);
        rating.setGrade(dto.getGrade());
        rating.setDescription(dto.getDescription());
        rating.setCreationDate(LocalDate.now());

        AlbumRating saved = albumRatingRepository.save(rating);
        return toDto(saved);
    }

    public AlbumRatingResponseDto updateRating(Long id, AlbumRatingRequestDto dto, Object principal) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        AlbumRating existing = albumRatingRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found or not owned by user"));

        if (dto.getGrade() != null) existing.setGrade(dto.getGrade());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        // album and user immutable here

        AlbumRating saved = albumRatingRepository.save(existing);
        return toDto(saved);
    }

    public void deleteRating(Long id, Object principal, boolean isAdmin) {
        AppUser user = resolveAppUserFromPrincipal(principal);
        if (isAdmin) {
            albumRatingRepository.deleteById(id);
            return;
        }
        AlbumRating existing = albumRatingRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found or not owned by user"));
        albumRatingRepository.delete(existing);
    }

    private AlbumRatingResponseDto toDto(AlbumRating r) {
        return new AlbumRatingResponseDto(
                r.getId(),
                r.getAlbum().getId(),
                r.getUser().getUsername(),
                r.getGrade(),
                r.getDescription(),
                r.getCreationDate()
        );
    }
}
