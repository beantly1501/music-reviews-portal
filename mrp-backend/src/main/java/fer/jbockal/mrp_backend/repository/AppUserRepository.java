package fer.jbockal.mrp_backend.repository;

import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.repository.projection.UserRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("select u.id as id, u.username as username from AppUser u order by u.username asc")
    List<UserRow> findAllUsers();

    @Query("select u.username from AppUser u where u.id <> :me order by u.username asc")
    List<String> findAllUsernamesExcept(@Param("me") Long me);
}
