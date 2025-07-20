package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.SongService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/song")
@AllArgsConstructor
@Slf4j
public class SongController {

    private final SongService songService;

    @GetMapping("/all")
    public ResponseEntity<List<Song>> getNewestRatings() {
        return ResponseEntity.ok(songService.getAllSongs());

    }

    @PostMapping("/create")
    public ResponseEntity<Song> createSong(@RequestBody SongRequestDto songRequest) {
        return ResponseEntity.ok(songService.createSong(songRequest));
    }

    @PutMapping("/update")
    public ResponseEntity<Song> updateSong(@RequestBody Song songRequest) {
        log.info("Updating song {}", songRequest);
        return ResponseEntity.ok(songService.updateSong(songRequest));
    }
}
