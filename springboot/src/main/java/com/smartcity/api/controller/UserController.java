package com.smartcity.api.controller;

import com.smartcity.api.model.User;
import com.smartcity.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserController(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @GetMapping
    public ResponseEntity<?> getAll(Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        return ResponseEntity.ok(repo.findAll().stream().map(u -> Map.of(
            "id", u.getId(), "name", u.getName(),
            "phone", u.getPhone() != null ? u.getPhone() : "",
            "role", u.getRole(), "created_at", u.getCreatedAt().toString()
        )).toList());
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> update(@PathVariable String name,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        if (!"admin".equals(auth.getDetails()) && !auth.getName().equals(name))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<User> opt = repo.findByName(name);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();
        if (body.containsKey("phone"))      user.setPhone(body.get("phone"));
        if (body.containsKey("password"))   user.setPassword(encoder.encode(body.get("password")));
        if (body.containsKey("avatar_img")) user.setAvatarImg(body.get("avatar_img"));
        repo.save(user);
        return ResponseEntity.ok(Map.of("message", "User updated"));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> delete(@PathVariable String name, Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<User> opt = repo.findByName(name);
        opt.ifPresent(repo::delete);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
