package com.etec.tourtripapi.config;

import com.etec.tourtripapi.role.entity.Role;
import com.etec.tourtripapi.role.repository.RoleRepository;
import com.etec.tourtripapi.setting.repository.SettingRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingRepository settingRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Backfill timestamps for settings created before audit columns existed
            settingRepository.findAll().forEach(s -> {
                if (s.getCreatedAt() == null || s.getUpdatedAt() == null) {
                    LocalDateTime now = LocalDateTime.now();
                    if (s.getCreatedAt() == null) s.setCreatedAt(now);
                    if (s.getUpdatedAt() == null) s.setUpdatedAt(now);
                    settingRepository.save(s);
                }
            });
            // 1. Create Roles if they don't exist
            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ADMIN");
                r.setCreatedAt(LocalDateTime.now());
                return roleRepository.save(r);
            });

            Role customerRole = roleRepository.findByName("CUSTOMER").orElseGet(() -> {
                Role r = new Role();
                r.setName("CUSTOMER");
                r.setCreatedAt(LocalDateTime.now());
                return roleRepository.save(r);
            });

            // 2. Create Default Admin User if not exists
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User admin = new User();
                admin.setFullName("Admin User");
                admin.setEmail("admin@gmail.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // Default password
                admin.setPhoneNumber("012345678");
                admin.setActive(true);

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);

                userRepository.save(admin);
            }

            // 3. Create Default Customer User if not exists
            if (userRepository.findByEmail("sinhporsurii@gmail.com").isEmpty()) {
                User customer = new User();
                customer.setFullName("Porsou");
                customer.setEmail("sinhporsurii@gmail.com");
                customer.setPassword(passwordEncoder.encode("password123")); // Default password
                customer.setPhoneNumber("011600961");
                customer.setActive(true);

                Set<Role> roles = new HashSet<>();
                roles.add(customerRole);
                customer.setRoles(roles);

                userRepository.save(customer);
            }
        };
    }
}