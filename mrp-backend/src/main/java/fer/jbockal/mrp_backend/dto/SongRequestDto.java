package fer.jbockal.mrp_backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class SongRequestDto {
    private String name;
    private byte[] cover;
    private String link;
    private byte[] file;
    private Long year;

    // optional associations
    private Set<Long> albumIds;
    private Set<Long> authorIds;
}
