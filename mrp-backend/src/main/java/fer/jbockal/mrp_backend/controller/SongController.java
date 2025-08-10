package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping({"/api/song", "/song"})
@AllArgsConstructor
@Slf4j
public class SongController {

    private final SongService songService;
    private final AppUserService appUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // -------- READ --------

    @GetMapping("/all")
    public ResponseEntity<List<SongResponseDto>> all(@AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(songService.getAllSongsWithReviewed(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongResponseDto> one(@PathVariable Long id,
                                               @AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(songService.findById(id, user));
    }

    @GetMapping(value = "/audio-file/{id}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<ByteArrayResource> streamAudio(@PathVariable Long id) {
        byte[] bytes = songService.getSongFile(id);

        if (bytes == null) {
            return ResponseEntity.noContent().build();
        }

        var resource = new ByteArrayResource(bytes);
        String filename = URLEncoder.encode("song-" + id, StandardCharsets.UTF_8) + ".bin";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentLength(bytes.length)
                .body(resource);
    }

    @GetMapping(value = "/image/{id}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<ByteArrayResource> image(@PathVariable Long id) {
        byte[] bytes = songService.getSongImage(id);

        if (bytes == null) {
            return ResponseEntity.notFound().build();
        }

        var resource = new ByteArrayResource(bytes);
        String filename = URLEncoder.encode("song-img-" + id, StandardCharsets.UTF_8) + ".bin";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentLength(bytes.length)
                .body(resource);
    }

    // -------- WRITE: JSON (existing) --------

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> createJson(@AuthenticationPrincipal Object principal,
                                                      @RequestBody SongRequestDto body) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(songService.createSong(body, user));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> updateJson(@PathVariable Long id,
                                                      @AuthenticationPrincipal Object principal,
                                                      @RequestBody SongRequestDto body) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(songService.updateSong(id, body, user));
    }

    // -------- WRITE: MULTIPART (new) --------
    // Hit this with POST /api/song/create (or /song/create) and FormData

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> createMultipart(
            @AuthenticationPrincipal Object principal,
            @RequestParam("name") String name,
            @RequestParam(value = "year", required = false) Long year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover, // image
            @RequestPart(value = "file", required = false) MultipartFile file,   // audio
            @RequestParam(value = "albumIds", required = false) String albumIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson,
            @RequestParam(value = "genreIds", required = false) String genreIdsJson
    ) throws Exception {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        SongRequestDto dto = new SongRequestDto();
        dto.setName(name);
        dto.setYear(year);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        if (file != null && !file.isEmpty()) dto.setFile(file.getBytes());
        dto.setAlbumIds(parseIdSet(albumIdsJson));
        dto.setArtistIds(parseIdSet(artistIdsJson));
        dto.setGenreIds(parseIdSet(genreIdsJson));

        return ResponseEntity.ok(songService.createSong(dto, user));
    }

    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<SongResponseDto> updateMultipart(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "year", required = false) Long year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson,
            @RequestParam(value = "genreIds", required = false) String genreIdsJson
    ) throws Exception {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        SongRequestDto dto = new SongRequestDto();
        dto.setName(name);
        dto.setYear(year);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        if (file != null && !file.isEmpty()) dto.setFile(file.getBytes());
        dto.setAlbumIds(parseIdSet(albumIdsJson));
        dto.setArtistIds(parseIdSet(artistIdsJson));
        dto.setGenreIds(parseIdSet(genreIdsJson));

        return ResponseEntity.ok(songService.updateSong(id, dto, user));
    }

    // -------- DELETE --------
    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    // -------- helper --------
    private Set<Long> parseIdSet(String json) throws Exception {
        if (json == null || json.isBlank()) return null;
        return objectMapper.readValue(json, new TypeReference<Set<Long>>() {
        });
    }
}
