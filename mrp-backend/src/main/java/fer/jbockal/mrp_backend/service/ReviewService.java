package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRatingResponseDto;
import fer.jbockal.mrp_backend.dto.ReviewResponseDto;
import fer.jbockal.mrp_backend.dto.SongRatingResponseDto;
import fer.jbockal.mrp_backend.model.AlbumRating;
import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.repository.AlbumRatingRepository;
import fer.jbockal.mrp_backend.repository.SongRatingRepository;
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

    private final SongRatingRepository songRatingRepository;
    private final AlbumRatingRepository albumRatingRepository;

    public List<ReviewResponseDto> getNewestReviews(int count) {
        if (count <= 0) return List.of();

        List<SongRating> newestSongRatings = songRatingRepository.findAll(
                PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "creationDate"))
        ).getContent();

        List<AlbumRating> newestAlbumRatings = albumRatingRepository.findAll(
                PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "creationDate"))
        ).getContent();

        List<ReviewResponseDto> combined = new ArrayList<>();

        combined.addAll(newestSongRatings.stream()
                .map(r -> new SongRatingResponseDto(
                        r.getId(),
                        r.getSong().getId(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate()
                ))
                .toList());

        combined.addAll(newestAlbumRatings.stream()
                .map(r -> new AlbumRatingResponseDto(
                        r.getId(),
                        r.getAlbum().getId(),
                        r.getUser().getUsername(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate()
                ))
                .toList());

        return combined.stream()
                .sorted(Comparator.comparing(ReviewResponseDto::creationDate).reversed())
                .limit(count)
                .collect(Collectors.toList());
    }
}
