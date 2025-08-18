package fer.jbockal.mrp_backend.dto.playlist;

import lombok.Data;

import java.util.List;

@Data
public class PlaylistRequestDto {
    private String name;
    private byte[] image;
    private String description;
    private Boolean isPrivate;

    private List<Long> songIds;
    private List<Long> collaboratorIds;
}
