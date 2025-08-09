package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.album.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.album.AlbumResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.service.AlbumService;
import fer.jbockal.mrp_backend.service.AppUserService;
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
@RequestMapping({"/api/album", "/album"})
@AllArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;
    private final AppUserService appUserService;

    @GetMapping("/all")
    public ResponseEntity<List<AlbumResponseDto>> all(@AuthenticationPrincipal Object principal) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.getAllAlbumsWithReviewed(user));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AlbumResponseDto>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(albumService.searchByNameFragment(query));
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

    @PostMapping
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> create(
            @AuthenticationPrincipal Object principal,
            @RequestBody AlbumRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.createAlbum(body, user));
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<AlbumResponseDto> update(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestBody AlbumRequestDto body
    ) {
        AppUser user = appUserService.resolveAppUserFromPrincipal(principal);
        return ResponseEntity.ok(albumService.updateAlbum(id, body, user));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN"})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }
}
