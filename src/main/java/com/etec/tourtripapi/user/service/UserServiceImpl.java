package com.etec.tourtripapi.user.service;

import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.role.entity.Role;
import com.etec.tourtripapi.role.service.RoleService;
import com.etec.tourtripapi.user.dto.request.SignupRequest;
import com.etec.tourtripapi.user.dto.request.UpdateRequest;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setActive(true);

        Role customerRole = roleService.findByName("CUSTOMER");
        user.setRoles(Collections.singleton(customerRole));

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, UpdateRequest request) {
        User user = getUserById(id);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Error: User not found with id " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found with id " + id));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}