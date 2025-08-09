package fer.jbockal.mrp_backend.controller;

import fer.jbockal.mrp_backend.dto.*;
import fer.jbockal.mrp_backend.dto.auth.AuthRequest;
import fer.jbockal.mrp_backend.dto.auth.AuthResponse;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Role;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import fer.jbockal.mrp_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository users;
    private final PasswordEncoder pwEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto dto) {
        if (users.existsByUsername(dto.username())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        AppUser u = new AppUser(
                dto.username(),
                pwEncoder.encode(dto.password()),
                dto.email(),
                dto.role()
        );
        users.save(u);

        // build UserDetails so we can generate token immediately
        UserDetails ud = org.springframework.security.core.userdetails.User
                .builder()
                .username(u.getUsername())
                .password(u.getPassword())
                .roles(u.getRole().name())
                .build();
        String token = jwtUtil.generateToken(ud);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest dto) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
        );
        UserDetails ud = users.findByUsername(dto.username())
                .map(user -> org.springframework.security.core.userdetails.User
                        .builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build()
                )
                .orElseThrow();
        String token = jwtUtil.generateToken(ud);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Bearer token");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        if (username == null) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        var userDetails = userDetailsService.loadUserByUsername(username);
        if (jwtUtil.validateToken(token, userDetails)) {
            return ResponseEntity.ok("valid");
        } else {
            return ResponseEntity.status(401).body("invalid or expired");
        }
    }

}
