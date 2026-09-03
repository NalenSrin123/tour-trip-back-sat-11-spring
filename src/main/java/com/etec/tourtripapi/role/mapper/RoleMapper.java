package com.etec.tourtripapi.role.mapper;

import com.etec.tourtripapi.role.dto.response.RoleResponse;
import com.etec.tourtripapi.role.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        if (role == null) {
            return null;
        }

        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        return response;
    }
}