package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.SongRatingDto;
import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.service.SongRatingService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@AllArgsConstructor
@RequestMapping("/song-rating")
public class SongRatingController {

    private final SongRatingService songRatingService;

    @GetMapping("/newest")
    public ResponseEntity<List<SongRating>> getNewestRatings() {
        return ResponseEntity.ok(songRatingService.getLatestRatings());

    }

    @PostMapping("/create")
    public ResponseEntity<SongRating> createSongRating(@RequestBody SongRatingDto songRatingDto) {

        return ResponseEntity.ok(songRatingService.createRating(songRatingDto));
    }
}
