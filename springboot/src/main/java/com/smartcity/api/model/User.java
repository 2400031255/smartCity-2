package com.smartcity.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "user";

    @Lob
    @Column(name = "avatar_img", columnDefinition = "LONGTEXT")
    private String avatarImg;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
