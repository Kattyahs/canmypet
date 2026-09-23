package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FoodSafetyRepository extends JpaRepository<FoodSafety, Long> {
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStage(Long foodId, Species species, LifeStage lifeStage);
    Optional<FoodSafety> findByFoodIdAndSpeciesAndLifeStageIsNull(Long foodId, Species species);
    List<FoodSafety> findByFoodIdAndSpecies(Long foodId, Species species);
    List<FoodSafety> findByFoodId(Long foodId);

    @EntityGraph(attributePaths = {"food"})
    Page<FoodSafety> findByVerifiedStatus(VerifiedStatus verifiedStatus, Pageable pageable);
}