package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.repository.SongRatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SongRatingService {
    private final SongRatingRepository songRatingRepository;

    public SongRatingService(SongRatingRepository songRatingRepository) {
        this.songRatingRepository = songRatingRepository;
    }

    public List<SongRating> getLatestRatings() {
        return songRatingRepository.findTop20ByOrderByCreationDateDesc();
    }
}
