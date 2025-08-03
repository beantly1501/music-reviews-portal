package fer.jbockal.mrp_backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class AuthorRequestDto {
    private String name;
    private Set<Long> songIds;  // optional
    private Set<Long> albumIds; // optional
}
