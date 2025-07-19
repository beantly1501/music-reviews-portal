package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public Optional<AppUser> getUserById(Long id) {
        return appUserRepository.findById(id);
    }
}
