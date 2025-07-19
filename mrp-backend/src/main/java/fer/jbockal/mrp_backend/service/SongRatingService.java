package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.SongRatingDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.model.SongRating;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import fer.jbockal.mrp_backend.repository.SongRatingRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class SongRatingService {
    private final SongRatingRepository songRatingRepository;
    private final SongRepository songRepository;
    private final AppUserRepository appUserRepository;


    public List<SongRating> getLatestRatings() {
        return songRatingRepository.findTop20ByOrderByCreationDateDesc();
    }


    public SongRating createRating(SongRatingDto songRatingDto) {
        // 1) Load the associations (they stay in the persistence context)
        Song song     = songRepository.findById(songRatingDto.getSongId())
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));
        AppUser user  = appUserRepository.findById(songRatingDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));


        // 3) Construct and set fields
        SongRating rating = new SongRating();
        rating.setSong(song);
        rating.setUser(user);
        rating.setGrade(songRatingDto.getGrade());
        rating.setDescription(songRatingDto.getDescription());
        rating.setCreationDate(LocalDate.now());

        // 4) Persist
        return songRatingRepository.save(rating);
    }
}
