package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.ArtistRequestDto;
import fer.jbockal.mrp_backend.dto.ArtistResponseDto;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.service.ArtistService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/artist")
@AllArgsConstructor
@Slf4j
public class ArtistController {

    private final ArtistService artistService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Retrieve all artists.
     */
    @GetMapping("/all")
    public ResponseEntity<List<ArtistResponseDto>> listAll() {
        List<ArtistResponseDto> dtos = artistService.findAll();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get an artist by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponseDto> getById(@PathVariable Long id) {
        ArtistResponseDto dto = artistService.findById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Search artists by name fragment.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ArtistResponseDto>> searchByName(@RequestParam("q") String query) {
        List<ArtistResponseDto> results = artistService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Create a new artist.
     */
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtistResponseDto> createArtist(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson
    ) throws IOException {
        ArtistRequestDto dto = new ArtistRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        if (image != null && !image.isEmpty()) {
            dto.setImage(image.getBytes());
        }
        if (songIdsJson != null) {
            Set<Long> songIds = objectMapper.readValue(songIdsJson, new TypeReference<Set<Long>>() {
            });
            dto.setSongIds(songIds);
        }
        if (albumIdsJson != null) {
            Set<Long> albumIds = objectMapper.readValue(albumIdsJson, new TypeReference<Set<Long>>() {
            });
            dto.setAlbumIds(albumIds);
        }
        ArtistResponseDto created = artistService.createArtist(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an existing artist.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtistResponseDto> updateArtist(
            @RequestPart("id") Long id,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "songIds", required = false) String songIdsJson,
            @RequestPart(value = "albumIds", required = false) String albumIdsJson
    ) throws IOException {
        Artist artistRequest = new Artist();
        artistRequest.setId(id);
        if (name != null) artistRequest.setName(name);
        if (description != null) artistRequest.setDescription(description);
        if (image != null && !image.isEmpty()) {
            artistRequest.setImage(image.getBytes());
        }
        if (songIdsJson != null) {
            Set<Long> songIds = objectMapper.readValue(songIdsJson, new TypeReference<Set<Long>>() {
            });
            for (Long sid : songIds) {
                Song stub = new Song();
                stub.setId(sid);
                artistRequest.getSongs().add(stub);
            }
        }
        if (albumIdsJson != null) {
            Set<Long> albumIds = objectMapper.readValue(albumIdsJson, new TypeReference<Set<Long>>() {
            });
            for (Long aid : albumIds) {
                Album stub = new Album();
                stub.setId(aid);
                artistRequest.getAlbums().add(stub);
            }
        }
        log.info("Updating artist {}", artistRequest);
        ArtistResponseDto updated = artistService.updateArtist(artistRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an artist by ID.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting artist with id {}", id);
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }
}
