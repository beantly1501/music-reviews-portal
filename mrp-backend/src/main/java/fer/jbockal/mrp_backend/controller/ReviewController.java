package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.ReviewResponseDto;
import fer.jbockal.mrp_backend.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
}
