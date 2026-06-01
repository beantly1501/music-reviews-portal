package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.artist.ArtistRequestDto;
import fer.jbockal.mrp_backend.dto.artist.ArtistResponseDto;
import fer.jbockal.mrp_backend.service.ArtistService;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping({"/api/artist", "/artist"})
@AllArgsConstructor
@Slf4j
public class ArtistController {

    private final ArtistService artistService;
    private final ObjectMapper objectMapper = new ObjectMapper();


    @GetMapping("/all")
    public ResponseEntity<List<ArtistResponseDto>> all() {
        return ResponseEntity.ok(artistService.getAllArtists());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ArtistResponseDto>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> albumIds,
            @RequestParam(required = false) List<Long> songIds,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(artistService.filterArtists(q, albumIds, songIds, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponseDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.findById(id));
    }


    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<ArtistResponseDto> createJson(@RequestBody ArtistRequestDto body) {
        return ResponseEntity.ok(artistService.createArtist(body));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<ArtistResponseDto> updateJson(@PathVariable Long id, @RequestBody ArtistRequestDto body) {
        return ResponseEntity.ok(artistService.updateArtist(id, body));
    }


    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<ArtistResponseDto> create(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson
    ) throws Exception {
        ArtistRequestDto dto = new ArtistRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        if (image != null && !image.isEmpty()) {
            dto.setImage(image.getBytes());
        }
        dto.setSongIds(parseIdSet(songIdsJson));
        dto.setAlbumIds(parseIdSet(albumIdsJson));
        return ResponseEntity.ok(artistService.createArtist(dto));
    }

    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<ArtistResponseDto> update(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "albumIds", required = false) String albumIdsJson
    ) throws Exception {
        ArtistRequestDto dto = new ArtistRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        if (image != null && !image.isEmpty()) {
            dto.setImage(image.getBytes());
        }
        dto.setSongIds(parseIdSet(songIdsJson));
        dto.setAlbumIds(parseIdSet(albumIdsJson));
        return ResponseEntity.ok(artistService.updateArtist(id, dto));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Long> parseIdSet(String json) throws Exception {
        if (json == null || json.isBlank()) return null;
        return objectMapper.readValue(json, new TypeReference<Set<Long>>() {
        });
    }
}
