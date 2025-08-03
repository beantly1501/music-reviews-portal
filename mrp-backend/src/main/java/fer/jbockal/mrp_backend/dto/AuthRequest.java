package fer.jbockal.mrp_backend.dto;

public record AuthRequest(
        String username,
        String password
) {}
