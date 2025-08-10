package fer.jbockal.mrp_backend.dto.playlist;

import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.dto.partial.UserPartialDto;

import java.time.LocalDate;
import java.util.Set;

public record PlaylistResponseDto(
        Long id,
        String name,
        String image,
        String description,
        boolean isPrivate,
        String ownerUsername,
        LocalDate creationDate,
        UserPartialDto lastEditedBy,
        Set<SongPartialDto> songs,
        Set<UserPartialDto> collaborators
) {
}
