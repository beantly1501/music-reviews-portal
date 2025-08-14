package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.UserResponseDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.projection.UserRow;
import fer.jbockal.mrp_backend.service.AppUserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/user")
public class AppUserController {

    private final AppUserService appUserService;

    @GetMapping("/me")
    public ResponseEntity<Optional<AppUser>> me(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(appUserService.getUserByUsername(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<AppUser>> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(appUserService.getUserById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDto>> getAllUsernames() {
        List<UserRow> list = appUserService.getAllUsers();
        return ResponseEntity.ok(list.stream().map(u -> new UserResponseDto(u.getId(), u.getUsername())).toList());
    }

    @GetMapping("/all-but-me")
    public ResponseEntity<List<UserResponseDto>> getOtherUsernames(
            @AuthenticationPrincipal Object principal
    ) {
        List<UserRow> list = appUserService.getAllUsernamesExceptMe(principal);
        return ResponseEntity.ok(list.stream().map(u -> new UserResponseDto(u.getId(), u.getUsername())).toList());
    }
}
