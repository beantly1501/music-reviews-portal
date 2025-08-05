package fer.jbockal.mrp_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlbumReviewRequestDto {
    private Long albumId;
    private Integer grade;
    private String description;
}
