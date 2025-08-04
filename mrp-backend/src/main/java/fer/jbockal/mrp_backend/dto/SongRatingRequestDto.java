package fer.jbockal.mrp_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SongRatingRequestDto {
    private Long songId;
    private Integer grade;
    private String description;
}
