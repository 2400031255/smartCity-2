package com.smartcity.api.controller;

import com.smartcity.api.model.TouristPlace;
import com.smartcity.api.repository.TouristPlaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/places")
public class TouristPlaceController {

    private final TouristPlaceRepository repo;

    public TouristPlaceController(TouristPlaceRepository repo) {
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
        TouristPlace place = new TouristPlace();
        place.setName(body.get("name"));
        place.setImage(body.get("image"));
        place.setDescription(body.get("description"));
        place.setAddress(body.get("address"));
        place.setIcon(body.getOrDefault("icon", "🏛️"));
        repo.save(place);
        return ResponseEntity.ok(Map.of("id", place.getId(), "message", "Place added"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        Optional<TouristPlace> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        TouristPlace place = opt.get();
        place.setName(body.get("name"));
        place.setImage(body.get("image"));
        place.setDescription(body.get("description"));
        place.setAddress(body.get("address"));
        place.setIcon(body.getOrDefault("icon", "🏛️"));
        repo.save(place);
        return ResponseEntity.ok(Map.of("message", "Place updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        if (!"admin".equals(auth.getDetails()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Place deleted"));
    }
}
