package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.review.ReviewResponseDto;
import fer.jbockal.mrp_backend.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@AllArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/newest")
    public ResponseEntity<List<ReviewResponseDto>> newest(@RequestParam(name = "count", defaultValue = "20") int count) {
        if (count <= 0) return ResponseEntity.badRequest().build();
        List<ReviewResponseDto> reviews = reviewService.getNewestReviews(count);

        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDto>> all() {
        List<ReviewResponseDto> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ReviewResponseDto>> mine(
            @AuthenticationPrincipal Object principal,
            @RequestParam(name = "count", required = false) Integer count
    ) {
        // default to all if count not provided
        List<ReviewResponseDto> reviews = reviewService.getReviewsByCurrentUser(principal, count);
        return ResponseEntity.ok(reviews);
    }
}
