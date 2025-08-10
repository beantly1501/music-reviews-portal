package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import fer.jbockal.mrp_backend.repository.projection.UserRow;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public Optional<AppUser> getUserById(Long id) {
        return appUserRepository.findById(id);
    }

    public Optional<AppUser> getUserByUsername(String username) {
        return appUserRepository.findByUsername(username);
    }


    public List<UserRow> getAllUsers() {
        return appUserRepository.findAllUsers();
    }

    public List<String> getAllUsernamesExceptMe(Object principal) {
        AppUser me = resolveAppUserFromPrincipal(principal);
        return appUserRepository.findAllUsernamesExcept(me.getId());
    }

    public AppUser resolveAppUserFromPrincipal(Object principalObj) {
        if (principalObj == null) {
            throw new IllegalArgumentException("Not authenticated");
        }
        String username;
        if (principalObj instanceof User userDetails) {
            username = userDetails.getUsername();
        } else if (principalObj instanceof UserDetails ud) {
            username = ud.getUsername();
        } else if (principalObj instanceof String) {
            username = (String) principalObj;
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " + principalObj.getClass());
        }
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}
