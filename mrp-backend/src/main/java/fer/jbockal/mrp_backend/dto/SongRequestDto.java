package fer.jbockal.mrp_backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SongRequestDto {

    private String name;

    private byte[] cover;

    private String link;

    private byte[] file;

    private Long year;
}
