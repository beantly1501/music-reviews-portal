package fer.jbockal.mrp_backend.security;

import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.AppUserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final AppUserRepository users;

    public AppUserDetailsService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        AppUser appUser = users.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("No user: " + username));
        return User.builder()
                .username(appUser.getUsername())
                .password(appUser.getPassword())
                .roles(appUser.getRole().name())
                .build();
    }
}
