package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.AuthorRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.service.AuthorService;
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
@RequestMapping("/author")
@AllArgsConstructor
@Slf4j
public class AuthorController {

    private final AuthorService authorService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/all")
    public ResponseEntity<Set<Author>> listAll() {
        return ResponseEntity.ok(authorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getById(@PathVariable Long id) {
        return ResponseEntity.ok(authorService.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Author>> searchByName(@RequestParam("q") String query) {
        List<Author> results = authorService.searchByNameFragment(query);
        return ResponseEntity.ok(results);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Author> createAuthor(
            @RequestPart("name") String name,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "songIds", required = false) String songIdsJson,
            @RequestPart(value = "albumIds", required = false) String albumIdsJson
    ) throws IOException {
        AuthorRequestDto dto = new AuthorRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        if (image != null && !image.isEmpty()) {
            dto.setImage(image.getBytes());
        }

        if (songIdsJson != null) {
            Set<Long> songIds = parseIdSet(songIdsJson);
            dto.setSongIds(songIds);
        }
        if (albumIdsJson != null) {
            Set<Long> albumIds = parseIdSet(albumIdsJson);
            dto.setAlbumIds(albumIds);
        }

        Author created = authorService.createAuthor(dto);
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Author> updateAuthor(
            @RequestPart("id") Long id,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "songIds", required = false) String songIdsJson,
            @RequestPart(value = "albumIds", required = false) String albumIdsJson
    ) throws IOException {
        Author authorRequest = new Author();
        authorRequest.setId(id);
        if (name != null) authorRequest.setName(name);
        if (description != null) authorRequest.setDescription(description);
        if (image != null && !image.isEmpty()) {
            authorRequest.setImage(image.getBytes());
        }

        if (songIdsJson != null) {
            Set<Long> songIds = parseIdSet(songIdsJson);
            for (Long sid : songIds) {
                Song stub = new Song();
                stub.setId(sid);
                authorRequest.getSongs().add(stub);
            }
        }

        if (albumIdsJson != null) {
            Set<Long> albumIds = parseIdSet(albumIdsJson);
            for (Long aid : albumIds) {
                Album stub = new Album();
                stub.setId(aid);
                authorRequest.getAlbums().add(stub);
            }
        }

        log.info("Updating author {}", authorRequest);
        Author updated = authorService.updateAuthor(authorRequest);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting author with id {}", id);
        authorService.deleteAuthor(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Long> parseIdSet(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Set<Long>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid id set JSON", e);
        }
    }
}
