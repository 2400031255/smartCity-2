package com.smartcity.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class SmartCityApplication {

    @Autowired
    private Environment env;

    public static void main(String[] args) {
        System.out.println("🚀 Starting Smart City Spring Boot API...");
        SpringApplication.run(SmartCityApplication.class, args);
    }

    @PostConstruct
    public void init() {
        String port = env.getProperty("server.port", "8080");
        String dbUrl = env.getProperty("spring.datasource.url", "not set");
        System.out.println("✅ Server starting on port: " + port);
        System.out.println("✅ Database URL: " + dbUrl.replaceAll("password=[^&]*", "password=***"));
        System.out.println("✅ JWT Secret length: " + env.getProperty("jwt.secret", "").length() + " chars");
    }
}
