package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.EmergencyGuide;
import com.canmypet.foodservice.model.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmergencyGuideRepository extends JpaRepository<EmergencyGuide, Long> {
    Optional<EmergencyGuide> findByRiskLevel(RiskLevel riskLevel);
}