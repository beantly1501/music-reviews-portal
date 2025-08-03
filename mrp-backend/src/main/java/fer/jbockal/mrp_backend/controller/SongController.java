package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.SongService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping(
            value    = "/audio-file/{id}",
            produces = { "audio/mpeg", "audio/ogg", "audio/wav" } // adjust to your formats
    )
    public ResponseEntity<ByteArrayResource> streamSongFile(@PathVariable Long id) {
        // 1) load your entity (with the byte[] in it)
        Song song = songService.findById(id);
        byte[] data = song.getFile();  // or song.getCover(), etc.

        // 2) wrap in a Resource
        ByteArrayResource resource = new ByteArrayResource(data);

        // 3) build headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentLength(data.length);
        // Let Spring pick the content‑type from the `produces`
        // If you need to be dynamic, you can do:
        // headers.setContentType(MediaType.parseMediaType(song.getMimeType()));

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(resource);
    }

    @PreAuthorize("hasRole('ADMIN')")
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
