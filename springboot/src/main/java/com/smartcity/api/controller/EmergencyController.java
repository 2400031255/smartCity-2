package com.smartcity.api.controller;

import com.smartcity.api.model.EmergencyNumber;
import com.smartcity.api.repository.EmergencyNumberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyNumberRepository repo;

    public EmergencyController(EmergencyNumberRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        EmergencyNumber e = new EmergencyNumber();
        e.setService(body.get("service"));
        e.setNumber(body.get("number"));
        e.setAddress(body.get("address"));
        e.setMapLink(body.get("map_link"));
        repo.save(e);
        return ResponseEntity.ok(Map.of("id", e.getId(), "message", "Emergency number added"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<EmergencyNumber> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        EmergencyNumber e = opt.get();
        e.setService(body.get("service"));
        e.setNumber(body.get("number"));
        e.setAddress(body.get("address"));
        e.setMapLink(body.get("map_link"));
        repo.save(e);
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
