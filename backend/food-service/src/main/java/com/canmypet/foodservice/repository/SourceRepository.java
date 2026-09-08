package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourceRepository extends JpaRepository<Source, Long> {
    List<Source> findByFoodSafetyId(Long foodSafetyId);
}