package fer.jbockal.mrp_backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class PlaylistRequestDto {
    private String name;
    private String description;
    private LocalDate creationDate;
    private Long lastEditedBy;
}
