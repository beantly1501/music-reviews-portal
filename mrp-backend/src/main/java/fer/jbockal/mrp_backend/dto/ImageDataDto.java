package fer.jbockal.mrp_backend.dto;

import org.springframework.http.MediaType;

public record ImageDataDto(byte[] bytes, MediaType mediaType) {
}