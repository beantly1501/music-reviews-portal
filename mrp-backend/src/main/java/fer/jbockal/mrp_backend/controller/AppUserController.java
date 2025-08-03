package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.AppUserInfoDto;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class AppUserController {

    private final AppUserRepository users;

    public AppUserController(AppUserRepository users) {
        this.users = users;
    }

    @GetMapping("/me")
    public ResponseEntity<AppUserInfoDto> me(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return users.findByUsername(principal.getUsername())
                .map(u -> ResponseEntity.ok(new AppUserInfoDto(u.getUsername(), u.getEmail())))
                .orElseGet(() -> ResponseEntity.status(404).build());
    }
}
