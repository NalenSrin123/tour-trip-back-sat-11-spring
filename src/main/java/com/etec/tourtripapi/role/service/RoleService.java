package com.etec.tourtripapi.role.service;

import com.etec.tourtripapi.role.dto.request.RoleRequest;
import com.etec.tourtripapi.role.entity.Role;
import java.util.List;

public interface RoleService {
    Role findByName(String name);
    Role findById(Long id);                  // Added
    Role createRole(RoleRequest request);
    Role updateRole(Long id, RoleRequest request); // Added
    void deleteRole(Long id);                // Added
    List<Role> getAllRoles();
}