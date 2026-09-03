package com.etec.tourtripapi.role.controller;

import com.etec.tourtripapi.role.dto.request.RoleRequest;
import com.etec.tourtripapi.role.dto.response.RoleResponse;
import com.etec.tourtripapi.role.entity.Role;
import com.etec.tourtripapi.role.mapper.RoleMapper;
import com.etec.tourtripapi.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        List<RoleResponse> responseList = roles.stream()
                .map(roleMapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        Role role = roleService.findById(id);
        return ResponseEntity.ok(roleMapper.toResponse(role));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@RequestBody RoleRequest request) {
        Role newRole = roleService.createRole(request);
        return ResponseEntity.ok(roleMapper.toResponse(newRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        Role updatedRole = roleService.updateRole(id, request);
        return ResponseEntity.ok(roleMapper.toResponse(updatedRole));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully with id: " + id);
    }
}