package com.etec.tourtripapi.user.repository;

import com.etec.tourtripapi.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Targeted admin lookup — replaces findAll() + in-memory role filtering
    List<User> findByRoles_Name(String roleName);
}