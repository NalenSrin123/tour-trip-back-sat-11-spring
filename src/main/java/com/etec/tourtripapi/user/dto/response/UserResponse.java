package com.etec.tourtripapi.user.dto.response;

import lombok.Data;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private boolean active;
    private Set<String> roles;
}
