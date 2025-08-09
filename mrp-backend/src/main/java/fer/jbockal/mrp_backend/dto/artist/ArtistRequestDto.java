package fer.jbockal.mrp_backend.dto.artist;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ArtistRequestDto {
    private String name;
    private byte[] image;
    private String description;
    private Set<Long> songIds;  // optional
    private Set<Long> albumIds; // optional
}
