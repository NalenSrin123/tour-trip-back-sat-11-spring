package com.etec.tourtripapi.user.mapper;

import com.etec.tourtripapi.user.dto.response.UserResponse;
import com.etec.tourtripapi.user.entity.User;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setActive(user.isActive());

        if (user.getRoles() != null) {
            response.setRoles(
                    user.getRoles().stream()
                            .map(role -> role.getName())
                            .collect(Collectors.toSet())
            );
        }

        return response;
    }
}