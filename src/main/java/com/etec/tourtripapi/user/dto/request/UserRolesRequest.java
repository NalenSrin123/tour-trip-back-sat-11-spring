package com.etec.tourtripapi.user.dto.request;

import lombok.Data;

import java.util.Set;

@Data
public class UserRolesRequest {
    private Set<String> roles;
}
