package com.etec.tourtripapi.user.controller;

import com.etec.tourtripapi.user.dto.request.SignupRequest;
import com.etec.tourtripapi.user.dto.request.UpdateRequest;
import com.etec.tourtripapi.user.dto.response.UserResponse;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.mapper.UserMapper;
import com.etec.tourtripapi.user.repository.UserRepository;
import com.etec.tourtripapi.user.service.UserService;
import com.etec.tourtripapi.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    // CREATE: Add a new user
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody SignupRequest request) {
        User createdUser = userService.createUser(request);
        return new ResponseEntity<>(userMapper.toResponse(createdUser), HttpStatus.CREATED);
    }

    // READ: Get all users with optional specifications/filters
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Boolean active) {

        Specification<User> spec = Specification.where(UserSpecification.hasFullName(fullName))
                .and(UserSpecification.hasEmail(email))
                .and(UserSpecification.isActive(active));

        List<User> users = userRepository.findAll(spec);
        List<UserResponse> responseList = users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    // READ: Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    // UPDATE: Update user information or active status
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UpdateRequest request) {
        User updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(userMapper.toResponse(updatedUser));
    }

    // DELETE: Delete user account
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully with id: " + id);
    }
}