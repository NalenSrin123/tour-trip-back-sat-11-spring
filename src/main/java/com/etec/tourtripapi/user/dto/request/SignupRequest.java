package com.etec.tourtripapi.user.dto.request;

import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
}
