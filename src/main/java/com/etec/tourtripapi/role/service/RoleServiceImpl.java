package com.etec.tourtripapi.role.service;

import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.role.dto.request.RoleRequest;
import com.etec.tourtripapi.role.entity.Role;
import com.etec.tourtripapi.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public Role findByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Role " + name + " not found."));
    }

    @Override
    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Role not found with id " + id));
    }

    @Override
    public Role createRole(RoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new ConflictException("Error: Role " + request.getName() + " already exists!");
        }

        Role role = new Role();
        role.setName(request.getName());
        return roleRepository.save(role);
    }

    @Override
    public Role updateRole(Long id, RoleRequest request) {
        Role existingRole = findById(id);

        // Check if the new name is already taken by another role
        roleRepository.findByName(request.getName()).ifPresent(role -> {
            if (!role.getId().equals(id)) {
                throw new ResourceNotFoundException("Error: Role name " + request.getName() + " is already in use!");
            }
        });

        existingRole.setName(request.getName());
        return roleRepository.save(existingRole);
    }

    @Override
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Error: Role not found with id " + id);
        }
        roleRepository.deleteById(id);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}