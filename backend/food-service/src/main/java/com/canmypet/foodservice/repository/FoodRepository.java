package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.Food;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByNameContainingIgnoreCase(String query, Pageable pageable);
    Page<Food> findAllByNameContainingIgnoreCase(String query, Pageable pageable);

}