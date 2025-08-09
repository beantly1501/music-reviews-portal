package fer.jbockal.mrp_backend.dto.partial;

import lombok.*;

import java.util.Set;

@Data
@AllArgsConstructor
public class ArtistPartialDto {
    private Long id;
    private String name;
    private String imageUrl;
    private String description;
}
