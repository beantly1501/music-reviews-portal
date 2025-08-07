package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumResponseDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.AlbumService;
import fer.jbockal.mrp_backend.service.AppUserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/album")
@AllArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;
    private final AppUserService appUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetch all albums with review status for current user.
     */
    @GetMapping("/all")
    public ResponseEntity<List<AlbumResponseDto>> all(@AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        List<AlbumResponseDto> dtos = albumService.getAllAlbumsWithReviewed(user);
        return ResponseEntity.ok(dtos);
    }

    /**
     * Search albums by name fragment.
     */
    @GetMapping("/search")
    public ResponseEntity<List<AlbumResponseDto>> searchByName(@RequestParam("q") String query) {
        List<AlbumResponseDto> results = albumService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Create a new album. Returns AlbumResponseDto.
     */
    @PostMapping(value = "/create")
    public ResponseEntity<AlbumResponseDto> createAlbum(
            @RequestParam("name") String name,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson
    ) throws IOException {
        AlbumRequestDto dto = new AlbumRequestDto();
        dto.setName(name);
        dto.setYear(year != null ? year.longValue() : null);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        if (songIdsJson != null) dto.setSongIds(parseIdSet(songIdsJson));
        if (artistIdsJson != null) dto.setArtistIds(parseIdSet(artistIdsJson));

        AlbumResponseDto created = albumService.createAlbum(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an existing album. Returns AlbumResponseDto.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AlbumResponseDto> updateAlbum(
            @RequestPart("id") Long id,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "year", required = false) Long year,
            @RequestPart(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestPart(value = "songIds", required = false) String songIdsJson,
            @RequestPart(value = "artistIds", required = false) String artistIdsJson
    ) throws IOException {
        Album albumRequest = new Album();
        albumRequest.setId(id);
        if (name != null) albumRequest.setName(name);
        if (year != null) albumRequest.setYear(year);
        if (link != null) albumRequest.setLink(link);
        if (cover != null && !cover.isEmpty()) albumRequest.setCover(cover.getBytes());
        if (songIdsJson != null) {
            Set<Long> songIds = parseIdSet(songIdsJson);
            for (Long sid : songIds) {
                Song stub = new Song();
                stub.setId(sid);
                albumRequest.getSongs().add(stub);
            }
        }
        if (artistIdsJson != null) {
            Set<Long> artistIds = parseIdSet(artistIdsJson);
            for (Long aid : artistIds) {
                Artist stub = new Artist();
                stub.setId(aid);
                albumRequest.getArtists().add(stub);
            }
        }
        log.info("Updating album {}", albumRequest);
        AlbumResponseDto updated = albumService.updateAlbum(albumRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an album by ID.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting album with id {}", id);
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Long> parseIdSet(String json) throws IOException {
        return objectMapper.readValue(json, new TypeReference<Set<Long>>() {
        });
    }
}