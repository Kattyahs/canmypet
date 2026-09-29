package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food, Long> {

    String NAME_MATCHES = "unaccent(lower(name)) LIKE '%' || unaccent(lower(:query)) || '%'";

    @Query(value = "SELECT * FROM foods WHERE " + NAME_MATCHES, nativeQuery = true)
    List<Food> searchByName(@Param("query") String query, Pageable pageable);

    @Query(
            value = "SELECT * FROM foods WHERE " + NAME_MATCHES,
            countQuery = "SELECT count(*) FROM foods WHERE " + NAME_MATCHES,
            nativeQuery = true
    )
    Page<Food> searchPageByName(@Param("query") String query, Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    Optional<Food> findByNameIgnoreCase(String name);
}