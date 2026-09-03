package com.etec.tourtripapi.auth.controller;

import com.etec.tourtripapi.auth.dto.request.ForgotPasswordRequest;
import com.etec.tourtripapi.auth.dto.request.LoginRequest;
import com.etec.tourtripapi.auth.dto.request.RegisterRequest;
import com.etec.tourtripapi.auth.dto.request.ResetPasswordRequest;
import com.etec.tourtripapi.auth.dto.request.VerifyOtpRequest;
import com.etec.tourtripapi.auth.dto.response.JwtResponse;
import com.etec.tourtripapi.auth.service.AuthService;
import com.etec.tourtripapi.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody RegisterRequest registerRequest) {
        User registeredUser = authService.registerUser(registerRequest);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<String> verifyRegistration(@RequestBody VerifyOtpRequest request) {
        authService.verifyRegistrationOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok("Account verified successfully! You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset OTP sent to your email.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isValid = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok("OTP verified successfully.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }
}