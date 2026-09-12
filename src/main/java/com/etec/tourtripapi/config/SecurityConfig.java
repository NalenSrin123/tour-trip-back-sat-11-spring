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

                        // 2. Public Read Access for Categories, Destinations, Tours, Files, and Schedules
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/destinations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/*/schedules/**").permitAll() // Public tour schedules read

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

                        // 7. Bookings (Authenticated users can create, view their own, and cancel bookings. Admin can view all and update status)
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings").hasRole("ADMIN") // Only admin can list all system bookings
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/status").hasRole("ADMIN") // Only admin can update status
                        .requestMatchers("/api/v1/bookings/**").authenticated() // Any other booking endpoint requires login

                        // 8. Users & Roles Management
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/roles/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}