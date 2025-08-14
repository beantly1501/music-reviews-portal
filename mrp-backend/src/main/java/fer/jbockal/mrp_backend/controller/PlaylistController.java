package fer.jbockal.mrp_backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fer.jbockal.mrp_backend.dto.playlist.PlaylistRequestDto;
import fer.jbockal.mrp_backend.dto.playlist.PlaylistResponseDto;
import fer.jbockal.mrp_backend.service.PlaylistService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistResponseDto> getById(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(playlistService.getById(principal, id));
    }

    @GetMapping("/public/{userId}")
    public ResponseEntity<Page<PlaylistResponseDto>> listPublicByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(playlistService.listPublicByUserId(userId, pageable));
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaylistResponseDto> createMultipart(
            @AuthenticationPrincipal Object principal,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isPrivate", required = false) Boolean isPrivate,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "songIds", required = false) String songIdsJson,
            @RequestParam(value = "collaboratorIds", required = false) String collaboratorIdsJson
    ) throws Exception {

        PlaylistRequestDto dto = new PlaylistRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setIsPrivate(isPrivate);
        if (image != null) dto.setImage(image.getBytes());

        dto.setSongIds(parseIdList(songIdsJson));
        dto.setCollaboratorIds(parseIdList(collaboratorIdsJson));

        return ResponseEntity.ok(playlistService.create(principal, dto));
    }

    // ---------- UPDATE (multipart) ----------
    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaylistResponseDto> updateMultipart(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isPrivate", required = false) Boolean isPrivate,
            @RequestPart(value = "image", required = false) MultipartFile image,           // cover image file
            @RequestParam(value = "songIds", required = false) String songIdsJson,         // JSON array as string
            @RequestParam(value = "collaboratorIds", required = false) String collaboratorIdsJson
    ) throws Exception {

        PlaylistRequestDto dto = new PlaylistRequestDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setIsPrivate(isPrivate);
        if (image != null) dto.setImage(image.getBytes());

        dto.setSongIds(parseIdList(songIdsJson));
        dto.setCollaboratorIds(parseIdList(collaboratorIdsJson));

        return ResponseEntity.ok(playlistService.update(principal, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id
    ) {
        playlistService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/songs")
    public ResponseEntity<PlaylistResponseDto> addSongs(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody List<Long> songIds
    ) {
        return ResponseEntity.ok(playlistService.addSongs(principal, id, songIds));
    }

    @DeleteMapping("/{id}/songs")
    public ResponseEntity<PlaylistResponseDto> removeSongs(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody List<Long> songIds
    ) {
        return ResponseEntity.ok(playlistService.removeSongs(principal, id, songIds));
    }

    @PostMapping("/{id}/collaborators")
    public ResponseEntity<PlaylistResponseDto> addCollaborators(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody List<Long> userIds
    ) {
        return ResponseEntity.ok(playlistService.addCollaborators(principal, id, userIds));
    }

    @DeleteMapping("/{id}/collaborators")
    public ResponseEntity<PlaylistResponseDto> removeCollaborators(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody List<Long> userIds
    ) {
        return ResponseEntity.ok(playlistService.removeCollaborators(principal, id, userIds));
    }

    @GetMapping("/mine")
    public ResponseEntity<Page<PlaylistResponseDto>> mine(
            @AuthenticationPrincipal Object principal,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(playlistService.listMine(principal, pageable));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<PlaylistResponseDto>> listPublic(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(playlistService.listPublic(pageable));
    }

    @GetMapping("/admin")
    public ResponseEntity<Page<PlaylistResponseDto>> adminList(
            @AuthenticationPrincipal Object principal,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(playlistService.listAllAsAdmin(principal, pageable));
    }

    // ---------- helper ----------
    private List<Long> parseIdList(String jsonArray) {
        if (jsonArray == null || jsonArray.isBlank()) return null;
        try {
            return objectMapper.readValue(jsonArray, new TypeReference<List<Long>>() {
            });
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid id list: " + jsonArray, e);
        }
    }
}
