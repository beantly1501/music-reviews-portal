package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.service.ImageService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/images", "/images"})
public class ImageController {

    private final ImageService imageService;

    @GetMapping("/song/{id}")
    public ResponseEntity<byte[]> getSongImage(@PathVariable Long id) {
        return imageService.getSongImage(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .body(data.bytes()))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/album/{id}")
    public ResponseEntity<byte[]> getAlbumImage(@PathVariable Long id) {
        return imageService.getAlbumImage(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .body(data.bytes()))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/artist/{id}")
    public ResponseEntity<byte[]> getArtistImage(@PathVariable Long id) {
        return imageService.getArtistImage(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .body(data.bytes()))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/playlist/{id}")
    public ResponseEntity<byte[]> getPlaylistImage(@PathVariable Long id) {
        return imageService.getPlaylistImage(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .body(data.bytes()))
                .orElse(ResponseEntity.noContent().build());
    }
}
