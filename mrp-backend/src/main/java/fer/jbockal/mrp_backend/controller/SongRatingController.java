package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.SongRatingDto;
import fer.jbockal.mrp_backend.service.SongRatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/song-rating")
public class SongRatingController {

    private final SongRatingService songRatingService;

    public SongRatingController(SongRatingService songRatingService) {
        this.songRatingService = songRatingService;
    }

    @GetMapping("/newest")
    public ResponseEntity<List<SongRatingDto>> getNewestRatings() {
        List<SongRatingDto> dtos = songRatingService.getLatestRatings().stream()
                .map(r -> new SongRatingDto(
                        r.getSong().getId(),
                        r.getUser().getId(),
                        r.getGrade(),
                        r.getDescription(),
                        r.getCreationDate()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
