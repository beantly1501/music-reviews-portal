package fer.jbockal.mrp_backend.dto;

public record RegisterDto(
        String username,
        String password,
        String email
) {}
