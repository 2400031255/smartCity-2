package com.smartcity.api.controller;

import com.smartcity.api.model.Bus;
import com.smartcity.api.repository.BusRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusRepository repo;

    public BusController(BusRepository repo) {
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
        Bus bus = new Bus();
        bus.setNumber(body.get("number"));
        bus.setRoute(body.get("route"));
        bus.setTime(body.get("time"));
        repo.save(bus);
        return ResponseEntity.ok(Map.of("id", bus.getId(), "message", "Bus added"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<Bus> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Bus bus = opt.get();
        bus.setNumber(body.get("number"));
        bus.setRoute(body.get("route"));
        bus.setTime(body.get("time"));
        repo.save(bus);
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
