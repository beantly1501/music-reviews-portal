package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.review.AlbumReviewResponseDto;
import fer.jbockal.mrp_backend.dto.review.ReviewResponseDto;
import fer.jbockal.mrp_backend.dto.review.SongReviewResponseDto;
import fer.jbockal.mrp_backend.model.AlbumReview;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.SongReview;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.SongReviewRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    public List<ReviewResponseDto> getNewestReviews(int count) {
        if (count <= 0) return List.of();

        List<SongReview> newestSongReviews = songReviewRepository.findAll(
                PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "creationDate"))
        ).getContent();

        List<AlbumReview> newestAlbumReviews = albumReviewRepository.findAll(
                PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "creationDate"))
        ).getContent();

        List<ReviewResponseDto> combined = new ArrayList<>();

        combined.addAll(newestSongReviews.stream()
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
                .toList());

        combined.addAll(newestAlbumReviews.stream()
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
                .toList());

        return combined.stream()
                .sorted(Comparator.comparing(ReviewResponseDto::creationDate).reversed())
                .limit(count)
                .collect(Collectors.toList());
    }

    public List<ReviewResponseDto> getAllReviews() {
        List<SongReview> allSongReviews = songReviewRepository.findAll(Sort.by(Sort.Direction.DESC, "creationDate"));
        List<AlbumReview> allAlbumReviews = albumReviewRepository.findAll(Sort.by(Sort.Direction.DESC, "creationDate"));

        return mergeAndSort(allSongReviews, allAlbumReviews);
    }

    public List<ReviewResponseDto> getReviewsByCurrentUser(Object principal, Integer count) {
        // Here, count==null means no limit
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        List<SongReview> userSongReviews = songReviewRepository.findByUser(user);
        List<AlbumReview> userAlbumReviews = albumReviewRepository.findByUser(user);

        List<ReviewResponseDto> merged = mergeAndSort(userSongReviews, userAlbumReviews);
        if (count != null && count > 0) {
            return merged.stream().limit(count).collect(Collectors.toList());
        }
        return merged;
    }

    private List<ReviewResponseDto> mergeAndSort(
            List<SongReview> songReviews,
            List<AlbumReview> albumReviews
    ) {
        List<ReviewResponseDto> combined = new ArrayList<>();

        songReviews.forEach(r -> combined.add(
                new SongReviewResponseDto(
                        r.getId(),
                        r.getSong().getId(),
                        r.getSong().getName(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate(),
                        "/images/song/" + r.getSong().getId()
                )
        ));

        albumReviews.forEach(r -> combined.add(
                new AlbumReviewResponseDto(
                        r.getId(),
                        r.getAlbum().getId(),
                        r.getAlbum().getName(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate(),
                        "/images/album/" + r.getAlbum().getId()
                )
        ));

        return combined.stream()
                .sorted(Comparator.comparing(ReviewResponseDto::creationDate).reversed())
                .collect(Collectors.toList());
    }
}
