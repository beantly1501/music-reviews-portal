package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.service.ImageService;
import lombok.AllArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@AllArgsConstructor
@RequestMapping("/images")
public class ImageController {

    private final ImageService imageService;


    @GetMapping("/song/{id}")
    public ResponseEntity<byte[]> getSongCover(@PathVariable Long id) {
        return imageService.getSongCover(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .cacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic())
                        .body(data.bytes()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/album/{id}")
    public ResponseEntity<byte[]> getAlbumCover(@PathVariable Long id) {
        return imageService.getAlbumCover(id)
                .map(data -> ResponseEntity.ok()
                        .contentType(data.mediaType())
                        .cacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic())
                        .body(data.bytes()))
                .orElse(ResponseEntity.notFound().build());
    }
}
