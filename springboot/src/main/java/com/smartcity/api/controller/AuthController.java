package com.smartcity.api.controller;

import com.smartcity.api.model.User;
import com.smartcity.api.repository.UserRepository;
import com.smartcity.api.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "time", System.currentTimeMillis()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String phone = body.get("phone");
        String password = body.get("password");
        String role = "admin".equals(body.get("role")) ? "admin" : "user";

        if (name == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Name and password required"));
        if (password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        if (phone != null && !phone.matches("[0-9]{10}"))
            return ResponseEntity.badRequest().body(Map.of("error", "Phone must be 10 digits"));
        if (userRepo.existsByName(name))
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));

        User user = new User();
        user.setName(name.trim());
        user.setPhone(phone);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "User created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String password = body.get("password");
        String role = body.getOrDefault("role", "user");

        if (name == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Name and password required"));

        Optional<User> userOpt = userRepo.findByNameAndRole(name, role);
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getRole());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of("name", user.getName(), "role", user.getRole(),
                           "phone", user.getPhone() != null ? user.getPhone() : "")
        ));
    }
}
