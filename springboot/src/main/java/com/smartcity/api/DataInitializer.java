package com.smartcity.api;

import com.smartcity.api.model.User;
import com.smartcity.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public DataInitializer(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        // Seed default admin
        if (userRepo.findByNameAndRole("nikhil", "admin").isEmpty()) {
            User admin = new User();
            admin.setName("nikhil");
            admin.setPhone("0000000000");
            admin.setPassword(encoder.encode("nikhil2006"));
            admin.setRole("admin");
            userRepo.save(admin);
            System.out.println("✅ Default admin created (nikhil / nikhil2006)");
        }
        System.out.println("✅ Smart City Spring Boot API Ready!");
    }
}
