package com.canmypet.userservice.repository;

import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByRoleAndVerified(Role role, Boolean verified, Pageable pageable);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);

}