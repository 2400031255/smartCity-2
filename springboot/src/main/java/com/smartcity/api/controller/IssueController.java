package com.smartcity.api.controller;

import com.smartcity.api.model.Issue;
import com.smartcity.api.repository.IssueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueRepository issueRepo;

    public IssueController(IssueRepository issueRepo) {
        this.issueRepo = issueRepo;
    }

    @GetMapping
    public ResponseEntity<?> getIssues(Authentication auth) {
        String role = (String) auth.getDetails();
        String name = auth.getName();
        List<Issue> issues = "admin".equals(role)
                ? issueRepo.findAllByOrderByCreatedAtDesc()
                : issueRepo.findByUserNameOrderByCreatedAtDesc(name);
        return ResponseEntity.ok(issues);
    }

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody Map<String, String> body, Authentication auth) {
        String name = body.get("name");
        String phone = body.get("phone");
        String category = body.get("category");
        String location = body.get("location");
        String description = body.get("description");

        if (name == null || phone == null || category == null || location == null || description == null)
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        if (!phone.matches("[0-9]{10}"))
            return ResponseEntity.badRequest().body(Map.of("error", "Phone must be 10 digits"));
        if (description.trim().length() < 10)
            return ResponseEntity.badRequest().body(Map.of("error", "Description too short"));

        Issue issue = new Issue();
        issue.setUserName(auth.getName());
        issue.setName(name.trim());
        issue.setPhone(phone);
        issue.setCategory(category);
        issue.setLocation(location.trim());
        issue.setDescription(description.trim());
        issue.setPhoto(body.get("photo"));
        issueRepo.save(issue);

        return ResponseEntity.ok(Map.of("id", issue.getId(), "message", "Issue reported"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body,
                                          Authentication auth) {
        Optional<Issue> opt = issueRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Issue issue = opt.get();
        if (body.containsKey("status"))   issue.setStatus((String) body.get("status"));
        if (body.containsKey("solution")) issue.setSolution((String) body.get("solution"));
        if (body.containsKey("priority")) issue.setPriority((String) body.get("priority"));
        if (body.containsKey("rating"))   issue.setRating((Integer) body.get("rating"));
        if (body.containsKey("solution_viewed")) issue.setSolutionViewed((Boolean) body.get("solution_viewed"));
        if (body.containsKey("resolved_viewed")) issue.setResolvedViewed((Boolean) body.get("resolved_viewed"));
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepo.save(issue);

        return ResponseEntity.ok(Map.of("message", "Issue updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        issueRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Issue deleted"));
    }
}
