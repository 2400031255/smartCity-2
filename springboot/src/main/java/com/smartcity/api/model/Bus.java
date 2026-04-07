package com.smartcity.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String number;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String route;

    @Column(nullable = false)
    private String time;
}
