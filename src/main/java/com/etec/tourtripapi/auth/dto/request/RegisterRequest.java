package com.etec.tourtripapi.auth.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
}