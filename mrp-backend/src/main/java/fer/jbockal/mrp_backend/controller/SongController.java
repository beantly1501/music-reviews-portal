package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.SongService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/song")
@AllArgsConstructor
@Slf4j
public class SongController {

    private final SongService songService;

    @GetMapping("/all")
    public ResponseEntity<List<Song>> all() {
        return ResponseEntity.ok(songService.getAllSongs());

    }

    @GetMapping("/search")
    public ResponseEntity<List<Song>> searchByName(@RequestParam("q") String query) {
        List<Song> results = songService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping(
            value    = "/audio-file/{id}",
            produces = { "audio/mpeg", "audio/ogg", "audio/wav" } // adjust to your formats
    )
    public ResponseEntity<ByteArrayResource> streamSongFile(@PathVariable Long id) {
        // 1) load your entity (with the byte[] in it)
        Song song = songService.findById(id);
        byte[] data = song.getFile();

        // 2) wrap in a Resource
        ByteArrayResource resource = new ByteArrayResource(data);

        // 3) build headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentLength(data.length);

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(resource);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/create")
    public ResponseEntity<Song> createSong(
            HttpServletRequest request,
            @RequestParam("name") String name,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson,
            @RequestParam(value = "authorIds", required = false) String authorIdsJson,
            @RequestParam(value = "genreIds", required = false) String genreIdsJson
    ) throws IOException {

        SongRequestDto dto = new SongRequestDto();
        dto.setName(name);
        dto.setYear(year != null ? year.longValue() : null);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) {
            dto.setCover(cover.getBytes());
        }
        if (file != null && !file.isEmpty()) {
            dto.setFile(file.getBytes());
        }
        if (albumIdsJson != null) {
            Set<Long> albumIds = parseIdSet(albumIdsJson);
            dto.setAlbumIds(albumIds);
        }
        if (authorIdsJson != null) {
            Set<Long> authorIds = parseIdSet(authorIdsJson);
            dto.setAuthorIds(authorIds);
        }
        if (genreIdsJson != null) {
            Set<Long> genreIds = parseIdSet(genreIdsJson);
            dto.setGenreIds(genreIds);
        }

        Song created = songService.createSong(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update")
    public ResponseEntity<Song> updateSong(@RequestBody Song songRequest) {
        log.info("Updating song {}", songRequest);
        return ResponseEntity.ok(songService.updateSong(songRequest));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        log.info("Deleting song with id {}", id);
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    // helper to parse JSON array string into Set<Long>
    private Set<Long> parseIdSet(String json) {
        try {
            ObjectMapper om = new ObjectMapper();
            return om.readValue(json, new TypeReference<Set<Long>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid id set JSON", e);
        }
    }
}
