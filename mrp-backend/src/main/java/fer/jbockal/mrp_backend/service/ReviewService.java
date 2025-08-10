package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.review.*;
import fer.jbockal.mrp_backend.model.*;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.SongReviewRepository;
import fer.jbockal.mrp_backend.repository.projection.AlbumReviewRow;
import fer.jbockal.mrp_backend.repository.projection.SongReviewRow;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReviewService {

    private final SongReviewRepository songReviewRepository;
    private final AlbumReviewRepository albumReviewRepository;
    private final AppUserService appUserService;
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;

    public List<ReviewResponseDto> getAllReviews() {
        List<SongReviewRow> songRows = songReviewRepository.findAllRows();
        List<AlbumReviewRow> albumRows = albumReviewRepository.findAllRows();
        return toDtos(songRows, albumRows);
    }

    public List<ReviewResponseDto> getReviewsByCurrentUser(Object principal, Integer count) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        List<SongReviewRow> songRows;
        List<AlbumReviewRow> albumRows;

        if (count != null && count > 0) {
            PageRequest pr = PageRequest.of(0, count);
            songRows = songReviewRepository.findRowsByUser(user, pr);
            albumRows = albumReviewRepository.findRowsByUser(user, pr);
        } else {
            songRows = songReviewRepository.findRowsByUser(user);
            albumRows = albumReviewRepository.findRowsByUser(user);
        }

        return toDtos(songRows, albumRows);
    }

    public List<ReviewResponseDto> getNewestReviews(Integer count) {
        List<SongReviewRow> songRows;
        List<AlbumReviewRow> albumRows;

        if (count != null && count > 0) {
            PageRequest pr = PageRequest.of(0, count);
            songRows = songReviewRepository.findAllRows(pr);
            albumRows = albumReviewRepository.findAllRows(pr);
        } else {
            songRows = songReviewRepository.findAllRows();
            albumRows = albumReviewRepository.findAllRows();
        }

        List<ReviewResponseDto> combined = toDtos(songRows, albumRows);
        if (count != null && count > 0 && combined.size() > count) {
            return combined.subList(0, count);
        }
        return combined;
    }

    private List<ReviewResponseDto> toDtos(List<SongReviewRow> songRows, List<AlbumReviewRow> albumRows) {
        List<ReviewResponseDto> out = new ArrayList<>(songRows.size() + albumRows.size());

        for (SongReviewRow r : songRows) {
            out.add(new SongReviewResponseDto(
                    r.getId(),
                    r.getSongId(),
                    r.getSongName(),
                    r.getUsername(),
                    r.getGrade(),
                    r.getDescription(),
                    r.getCreationDate(),
                    "/images/song/" + r.getSongId()
            ));
        }
        for (AlbumReviewRow r : albumRows) {
            out.add(new AlbumReviewResponseDto(
                    r.getId(),
                    r.getAlbumId(),
                    r.getAlbumName(),
                    r.getUsername(),
                    r.getGrade(),
                    r.getDescription(),
                    r.getCreationDate(),
                    "/images/album/" + r.getAlbumId()
            ));
        }

        return out.stream()
                .sorted(Comparator.comparing(ReviewResponseDto::creationDate).reversed())
                .collect(Collectors.toList());
    }

    // === SONG REVIEWS ===
    public List<SongReviewResponseDto> getSongReviews(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + songId));
        return songReviewRepository.findBySong(song).stream()
                .map(r -> new SongReviewResponseDto(
                        r.getId(),
                        r.getSong().getId(),
                        r.getSong().getName(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate(),
                        "/images/song/" + r.getSong().getId()
                ))
                .collect(Collectors.toList());
    }


    public SongReviewResponseDto createSongReview(
            Object principal,
            SongReviewRequestDto dto
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        Song song = songRepository.findById(dto.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + dto.getSongId()));
        SongReview rev = new SongReview(
                null, song, user, dto.getGrade(), dto.getDescription(), java.time.LocalDate.now()
        );
        songReviewRepository.save(rev);
        return new SongReviewResponseDto(
                rev.getId(), song.getId(), song.getName(), user.getUsername(), rev.getGrade(),
                rev.getDescription(), rev.getCreationDate(), "/images/song/" + song.getId()
        );
    }

    public SongReviewResponseDto updateSongReview(
            Object principal,
            Long reviewId,
            SongReviewRequestDto dto
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongReview rev = songReviewRepository.findByIdAndUser(reviewId, user)
                .orElseThrow(() -> new IllegalArgumentException("Song review not found or not owned: " + reviewId));
        if (dto.getGrade() != null) rev.setGrade(dto.getGrade());
        if (dto.getDescription() != null) rev.setDescription(dto.getDescription());
        songReviewRepository.save(rev);
        Song song = rev.getSong();
        return new SongReviewResponseDto(
                rev.getId(), song.getId(), song.getName(), user.getUsername(), rev.getGrade(),
                rev.getDescription(), rev.getCreationDate(), "/images/song/" + song.getId()
        );
    }

    public void deleteSongReview(Object principal, Long reviewId) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongReview rev = songReviewRepository.findByIdAndUser(reviewId, user)
                .orElseThrow(() -> new IllegalArgumentException("Song review not found or not owned: " + reviewId));
        songReviewRepository.delete(rev);
    }

    // === ALBUM REVIEWS ===
    public List<AlbumReviewResponseDto> getAlbumReviews(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));
        return albumReviewRepository.findByAlbum(album).stream()
                .map(r -> new AlbumReviewResponseDto(
                        r.getId(),
                        r.getAlbum().getId(),
                        r.getAlbum().getName(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate(),
                        "/images/album/" + r.getAlbum().getId()
                ))
                .collect(Collectors.toList());
    }

    public AlbumReviewResponseDto createAlbumReview(
            Object principal,
            AlbumReviewRequestDto dto
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        Album album = albumRepository.findById(dto.getAlbumId())
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + dto.getAlbumId()));
        AlbumReview rev = new AlbumReview(
                null, album, user, dto.getGrade(), dto.getDescription(), java.time.LocalDate.now()
        );
        albumReviewRepository.save(rev);
        return new AlbumReviewResponseDto(
                rev.getId(), album.getId(), album.getName(), user.getUsername(), rev.getGrade(),
                rev.getDescription(), rev.getCreationDate(), "/images/album/" + album.getId()
        );
    }

    public AlbumReviewResponseDto updateAlbumReview(
            Object principal,
            Long reviewId,
            AlbumReviewRequestDto dto
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        AlbumReview rev = albumReviewRepository.findByIdAndUser(reviewId, user)
                .orElseThrow(() -> new IllegalArgumentException("Album review not found or not owned: " + reviewId));
        if (dto.getGrade() != null) rev.setGrade(dto.getGrade());
        if (dto.getDescription() != null) rev.setDescription(dto.getDescription());
        albumReviewRepository.save(rev);
        Album album = rev.getAlbum();
        return new AlbumReviewResponseDto(
                rev.getId(), album.getId(), album.getName(), user.getUsername(), rev.getGrade(),
                rev.getDescription(), rev.getCreationDate(), "/images/album/" + album.getId()
        );
    }

    public void deleteAlbumReview(Object principal, Long reviewId) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        AlbumReview rev = albumReviewRepository.findByIdAndUser(reviewId, user)
                .orElseThrow(() -> new IllegalArgumentException("Album review not found or not owned: " + reviewId));
        albumReviewRepository.delete(rev);
    }
}
