package com.etec.tourtripapi.auth.service;

import com.etec.tourtripapi.auth.dto.request.RegisterRequest;
import com.etec.tourtripapi.auth.dto.request.ResetPasswordRequest;
import com.etec.tourtripapi.auth.dto.response.JwtResponse;
import com.etec.tourtripapi.auth.dto.request.LoginRequest;
import com.etec.tourtripapi.user.entity.User;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    User registerUser(RegisterRequest registerRequest);
    void verifyRegistrationOtp(String email, String otp);
    void forgotPassword(String email);
    boolean verifyOtp(String email, String otp);
    void resetPassword(ResetPasswordRequest request);
}