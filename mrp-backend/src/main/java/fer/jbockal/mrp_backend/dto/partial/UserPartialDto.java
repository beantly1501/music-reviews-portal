package fer.jbockal.mrp_backend.dto.partial;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserPartialDto {
    private Long id;
    private String username;
}
