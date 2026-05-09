package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.album.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.album.AlbumResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.service.AlbumService;
import fer.jbockal.mrp_backend.service.AppUserService;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping({"/api/album", "/album"})
@AllArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;
    private final AppUserService appUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();


    @GetMapping("/all")
    public ResponseEntity<Page<AlbumResponseDto>> all(
            @AuthenticationPrincipal Object principal,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.getAllAlbumsWithReviewed(user, pageable));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<AlbumResponseDto>> filter(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> artistIds,
            @RequestParam(required = false) List<Long> genreIds,
            @AuthenticationPrincipal Object principal,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.filterAlbums(q, artistIds, genreIds, user, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumResponseDto> one(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.findById(id, user));
    }


    @GetMapping(value = "/image/{id}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<ByteArrayResource> image(@PathVariable Long id) {
        byte[] bytes = albumService.getAlbumImage(id);
        var resource = new ByteArrayResource(bytes);
        String filename = URLEncoder.encode("album-" + id, StandardCharsets.UTF_8) + ".bin";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentLength(bytes.length)
                .body(resource);
    }


    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> createJson(
            @AuthenticationPrincipal Object principal,
            @RequestBody AlbumRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.createAlbum(body, user));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> updateJson(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestBody AlbumRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.updateAlbum(id, body, user));
    }


    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> createMultipart(
            @AuthenticationPrincipal Object principal,
            @RequestParam("name") String name,
            @RequestParam(value = "year", required = false) Long year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson
    ) throws Exception {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        AlbumRequestDto dto = new AlbumRequestDto();
        dto.setName(name);
        dto.setYear(year);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        dto.setSongIds(parseIdSet(songIdsJson));
        dto.setArtistIds(parseIdSet(artistIdsJson));

        return ResponseEntity.ok(albumService.createAlbum(dto, user));
    }

    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> updateMultipart(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "year", required = false) Long year,
            @RequestParam(value = "link", required = false) String link,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "artistIds", required = false) String artistIdsJson
    ) throws Exception {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);

        AlbumRequestDto dto = new AlbumRequestDto();
        dto.setName(name);
        dto.setYear(year);
        dto.setLink(link);
        if (cover != null && !cover.isEmpty()) dto.setCover(cover.getBytes());
        dto.setSongIds(parseIdSet(songIdsJson));
        dto.setArtistIds(parseIdSet(artistIdsJson));

        return ResponseEntity.ok(albumService.updateAlbum(id, dto, user));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Long> parseIdSet(String json) throws Exception {
        if (json == null || json.isBlank()) return null;
        return objectMapper.readValue(json, new TypeReference<Set<Long>>() {
        });
    }
}
