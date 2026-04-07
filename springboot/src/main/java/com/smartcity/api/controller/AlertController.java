package com.smartcity.api.controller;

import com.smartcity.api.model.Alert;
import com.smartcity.api.repository.AlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository repo;

    public AlertController(AlertRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(repo.findTop10ByOrderByTimeDesc());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Alert alert = new Alert();
        alert.setType(body.get("type"));
        alert.setMessage(body.get("message"));
        alert.setTime(System.currentTimeMillis());
        repo.save(alert);
        return ResponseEntity.ok(Map.of("id", alert.getId(), "message", "Alert added"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<Alert> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Alert alert = opt.get();
        alert.setType(body.get("type"));
        alert.setMessage(body.get("message"));
        repo.save(alert);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
