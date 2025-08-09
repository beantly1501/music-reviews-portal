package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.song.SongRequestDto;
import fer.jbockal.mrp_backend.dto.song.SongResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.service.AppUserService;
import fer.jbockal.mrp_backend.service.SongService;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/song")
@AllArgsConstructor
@Slf4j
public class SongController {

    private final SongService songService;
    private final AppUserService appUserService;

    @GetMapping("/all")
    public ResponseEntity<List<SongResponseDto>> all(@AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        List<SongResponseDto> dtos = songService.getAllSongsWithReviewed(user);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SongResponseDto>> searchByName(@RequestParam("q") String query) {
        List<SongResponseDto> results = songService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongResponseDto> one(@PathVariable Long id, @AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(songService.findById(id, user));
    }

    @GetMapping(
            value = "/audio-file/{id}",
            produces = {"audio/mpeg", "audio/ogg", "audio/wav"}
    )
    public ResponseEntity<ByteArrayResource> streamAudio(@PathVariable Long id) {
        byte[] bytes = songService.getSongFile(id);
        var resource = new ByteArrayResource(bytes);

        // Optional content-disposition: "song-{id}.mp3" (generic)
        String filename = URLEncoder.encode("song-" + id, StandardCharsets.UTF_8) + ".bin";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentLength(bytes.length)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // ---------- Write endpoints ----------

    @PostMapping
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> create(
            @AuthenticationPrincipal Object principal,
            @RequestBody SongRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongResponseDto created = songService.createSong(body, user);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> update(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestBody SongRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        SongResponseDto updated = songService.updateSong(id, body, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
