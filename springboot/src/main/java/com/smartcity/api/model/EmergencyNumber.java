package com.smartcity.api.model;

import jakarta.persistence.*;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getMapLink() { return mapLink; }
    public void setMapLink(String mapLink) { this.mapLink = mapLink; }
}
