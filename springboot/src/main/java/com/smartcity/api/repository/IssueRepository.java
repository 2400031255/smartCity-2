package com.smartcity.api.repository;

import com.smartcity.api.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByUserNameOrderByCreatedAtDesc(String userName);
    List<Issue> findAllByOrderByCreatedAtDesc();
}
