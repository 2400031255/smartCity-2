package com.smartcity.api.model;

import jakarta.persistence.*;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
