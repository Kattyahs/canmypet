package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodSafetyRepository extends JpaRepository<FoodSafety, Long> {
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStage(Long foodId, Species species, LifeStage lifeStage);
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStageIsNull(Long foodId, Species species);
    List<FoodSafety> findByFoodIdAndSpecies(Long foodId, Species species);
    List<FoodSafety> findByFoodId(Long foodId);
}