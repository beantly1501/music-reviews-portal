package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.service.AlbumService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/album")
@AllArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;

    @PostMapping("/create")
    public ResponseEntity<Album> createAlbum(@RequestBody AlbumRequestDto albumRequest) {
        return ResponseEntity.ok(albumService.createAlbum(albumRequest));
    }

    @PutMapping("/update")
    public ResponseEntity<Album> updateSong(@RequestBody Album albumRequest) {
        log.info("Updating album {}", albumRequest);
        return ResponseEntity.ok(albumService.updateAlbum(albumRequest));
    }

}
