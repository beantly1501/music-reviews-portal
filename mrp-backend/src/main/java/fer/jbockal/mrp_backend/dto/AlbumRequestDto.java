package fer.jbockal.mrp_backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class AlbumRequestDto {
    private String name;
    private byte[] cover;
    private String link;
    private Long year;
    private Set<Long> songIds;   // optional association
    private Set<Long> artistIds; // optional association
}
