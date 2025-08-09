package fer.jbockal.mrp_backend.dto.auth;

public record AuthRequest(
        String username,
        String password
) {
}
