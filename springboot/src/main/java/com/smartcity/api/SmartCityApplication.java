package com.smartcity.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartCityApplication {
    public static void main(String[] args) {
        System.out.println("🚀 Starting Smart City Spring Boot API...");
        SpringApplication.run(SmartCityApplication.class, args);
        System.out.println("✅ Smart City API started successfully!");
    }
}
