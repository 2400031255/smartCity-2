package com.smartcity.api.repository;

import com.smartcity.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNameAndRole(String name, String role);
    Optional<User> findByName(String name);
    boolean existsByName(String name);
}
