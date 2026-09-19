package com.etec.tourtripapi.config;

import com.etec.tourtripapi.security.filter.JwtTokenFilter;
import com.etec.tourtripapi.security.handler.AuthEntryPointJwt;
import com.etec.tourtripapi.security.userdetails.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtTokenFilter jwtTokenFilter;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Public Authentication & Docs
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // 2. Public Read Access for Categories, Destinations, Tours, Files, Schedules, and Reviews
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/destinations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/*/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/*/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/settings/**").permitAll()

                        // 3. Admin-Only Management for Categories
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        // 4. Admin-Only Management for Destinations
                        .requestMatchers(HttpMethod.POST, "/api/v1/destinations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/destinations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/destinations/**").hasRole("ADMIN")

                        // 5. Admin-Only Management for Tours
                        .requestMatchers(HttpMethod.POST, "/api/v1/tours/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/tours/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/tours/**").hasRole("ADMIN")

                        // 6. Admin-Only Management for Tour Schedules (POST, PUT, DELETE)
                        .requestMatchers(HttpMethod.POST, "/api/v1/tours/*/schedules/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/schedules/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedules/**").hasRole("ADMIN")

                        // 7. Bookings
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/status").hasRole("ADMIN")
                        .requestMatchers("/api/v1/bookings/**").authenticated()

                        // 8. Reviews Management
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/**").hasRole("ADMIN")

                        // 9. Payment
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments").authenticated()
                        .requestMatchers("/api/v1/payments/**").hasRole("ADMIN")

                        // 10. Refund
                        .requestMatchers(HttpMethod.POST, "/api/v1/refunds").authenticated()
                        .requestMatchers("/api/v1/refunds/**").hasRole("ADMIN")

                        // 11. Notification
                        .requestMatchers("/api/v1/notifications/**").authenticated()

                        // 12. Setting (Admin Only)
                        .requestMatchers("/api/v1/settings/**").hasRole("ADMIN")

                        // 13. Dashboard (Admin Only)
                        .requestMatchers("/api/v1/dashboard/**").hasRole("ADMIN")

                        // 14. Users & Roles Management
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/roles/**").hasRole("ADMIN")

                        // 15. Reports (Admin Only)
                        .requestMatchers("/api/v1/reports/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}