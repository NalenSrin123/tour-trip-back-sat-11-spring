package com.etec.tourtripapi.auth.service;

import com.etec.tourtripapi.auth.dto.request.RegisterRequest;
import com.etec.tourtripapi.auth.dto.request.ResetPasswordRequest;
import com.etec.tourtripapi.auth.dto.response.JwtResponse;
import com.etec.tourtripapi.auth.dto.request.LoginRequest;
import com.etec.tourtripapi.common.exception.BadRequestException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.role.service.RoleServiceImpl;
import com.etec.tourtripapi.security.jwt.JwtUtils;
import com.etec.tourtripapi.user.dto.request.SignupRequest;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import com.etec.tourtripapi.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final RoleServiceImpl roleServiceImpl;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        // Block login if user hasn't verified their registration OTP
        if (!user.isActive()) {
            throw new BadRequestException("Please verify your account with the OTP sent to your email before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().replace("ROLE_", "")) // Strips prefix if it exists, leaving clean "ADMIN" or "CUSTOMER"
                .collect(Collectors.toList());

        return new JwtResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    @Override
    public User registerUser(RegisterRequest registerRequest) {
        // Map RegisterRequest to SignupRequest
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setFullName(registerRequest.getFullName());
        signupRequest.setEmail(registerRequest.getEmail());
        signupRequest.setPassword(registerRequest.getPassword());
        signupRequest.setPhoneNumber(registerRequest.getPhoneNumber());

        // Create user using existing service logic
        User user = userService.createUser(signupRequest);
        user.setActive(false); // Inactive until OTP verification is completed

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setOtpExpiryDate(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send OTP email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Account Verification OTP");
        message.setText("Your account verification code is: " + otp + ". It expires in 10 minutes.");
        mailSender.send(message);

        return user;
    }

    @Override
    public void verifyRegistrationOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code!");
        }

        if (user.getOtpExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired!");
        }

        // Activate user and clear OTP fields
        user.setActive(true);
        user.setResetOtp(null);
        user.setOtpExpiryDate(null);
        userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setOtpExpiryDate(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset OTP");
        message.setText("Your password reset code is: " + otp + ". It expires in 10 minutes.");
//        mailSender.send(message);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code!");
        }

        if (user.getOtpExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired!");
        }

        return true;
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        verifyOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setOtpExpiryDate(null);
        userRepository.save(user);
    }
}