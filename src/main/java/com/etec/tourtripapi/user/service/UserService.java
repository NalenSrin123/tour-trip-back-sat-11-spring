package com.etec.tourtripapi.user.service;

import com.etec.tourtripapi.user.dto.request.SignupRequest;
import com.etec.tourtripapi.user.dto.request.UpdateRequest;
import com.etec.tourtripapi.user.entity.User;
import java.util.List;
import java.util.Set;

public interface UserService {
    User createUser(SignupRequest request); // Renamed from registerUser
    User updateUser(Long id, UpdateRequest request);
    User updateRoles(Long id, Set<String> roleNames);
    void deleteUser(Long id);
    User getUserById(Long id);
    List<User> getAllUsers();
}