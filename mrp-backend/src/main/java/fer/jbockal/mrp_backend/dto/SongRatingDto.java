package fer.jbockal.mrp_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SongRatingDto {
    private Long songId;
    private Long userId;
    private Integer grade;
    private String description;
    private LocalDate creationDate;
}
