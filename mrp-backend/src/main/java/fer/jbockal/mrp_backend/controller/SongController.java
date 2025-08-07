package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.dto.SongResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.AppUserService;
import fer.jbockal.mrp_backend.service.SongService;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final AppUserService appUserService;

    /**
     * Fetch all songs with review status and grades for current user.
     */
    @GetMapping("/all")
    public ResponseEntity<List<SongResponseDto>> all(@AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        List<SongResponseDto> dtos = songService.getAllSongsWithReviewed(user);
        return ResponseEntity.ok(dtos);
    }

    /**
     * Search songs by name fragment (case-insensitive).
     */
    @GetMapping("/search")
    public ResponseEntity<List<SongResponseDto>> searchByName(@RequestParam("q") String query) {
        List<SongResponseDto> results = songService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Stream the raw audio file for a given song ID.
     */
    @GetMapping(
            value = "/audio-file/{id}",
            produces = {"audio/mpeg", "audio/ogg", "audio/wav"}
    )
    public ResponseEntity<ByteArrayResource> streamSongFile(@PathVariable Long id) {
        byte[] data = songService.getSongFile(id);
        ByteArrayResource resource = new ByteArrayResource(data);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentLength(data.length);
        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    /**
     * Create a new song. Returns the created SongResponseDto.
     */
    @PostMapping(value = "/create")
    public ResponseEntity<SongResponseDto> createSong(
            @RequestParam("name") String name,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson,
            @RequestParam(value = "genreIds", required = false) String genreIdsJson
    ) throws IOException {

        SongRequestDto dto = new SongRequestDto();
        dto.setName(name);
        dto.setYear(year != null ? year.longValue() : null);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        if (file != null && !file.isEmpty()) dto.setFile(file.getBytes());
        if (albumIdsJson != null) dto.setAlbumIds(parseIdSet(albumIdsJson));
        if (artistIdsJson != null) dto.setArtistIds(parseIdSet(artistIdsJson));
        if (genreIdsJson != null) dto.setGenreIds(parseIdSet(genreIdsJson));

        SongResponseDto created = songService.createSong(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an existing Song entity. Returns the updated SongResponseDto.
     */
    @PutMapping("/update")
    public ResponseEntity<SongResponseDto> updateSong(@RequestBody Song songRequest) {
        log.info("Updating song {}", songRequest);
        SongResponseDto updated = songService.updateSong(songRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a song by ID (admin only).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        log.info("Deleting song with id {}", id);
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    // Helper to parse JSON array string into Set<Long>
    private Set<Long> parseIdSet(String json) {
        try {
            ObjectMapper om = new ObjectMapper();
            return om.readValue(json, new TypeReference<Set<Long>>() {
            });
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid id set JSON", e);
        }
    }
}
