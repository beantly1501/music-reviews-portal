package fer.jbockal.mrp_backend.dto;

import fer.jbockal.mrp_backend.model.Role;

public record RegisterDto(
        String username,
        String password,
        String email,
        Role role
) {
}
