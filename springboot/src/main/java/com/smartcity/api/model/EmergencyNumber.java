package com.smartcity.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "emergency_numbers")
public class EmergencyNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String service;

    @Column(nullable = false)
    private String number;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "map_link", columnDefinition = "TEXT")
    private String mapLink;
}
