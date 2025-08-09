package fer.jbockal.mrp_backend.dto.genre;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class GenreRequestDto {
    private String name;
    private Set<Long> songIds;
}
