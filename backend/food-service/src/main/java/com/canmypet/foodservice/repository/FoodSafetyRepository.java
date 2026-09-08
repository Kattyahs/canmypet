package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodSafetyRepository extends JpaRepository<FoodSafety, Long> {
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStage(Long foodId, String species, LifeStage lifeStage);
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStageIsNull(Long foodId, String species);
    List<FoodSafety> findByFoodIdAndSpecies(Long foodId, String species);
    List<FoodSafety> findByFoodId(Long foodId);
}