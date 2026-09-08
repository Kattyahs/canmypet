package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.EmergencyGuideRequest;
import com.canmypet.foodservice.dto.EmergencyGuideResponse;
import com.canmypet.foodservice.exception.EmergencyGuideNotFoundException;
import com.canmypet.foodservice.model.EmergencyGuide;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.repository.EmergencyGuideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmergencyGuideService {

    private final EmergencyGuideRepository emergencyGuideRepository;

    public EmergencyGuideResponse getByRiskLevel(RiskLevel riskLevel) {
        EmergencyGuide guide = emergencyGuideRepository.findByRiskLevel(riskLevel)
                .orElseThrow(() -> new EmergencyGuideNotFoundException(riskLevel.name()));
        return toResponse(guide);
    }

    public EmergencyGuideResponse createOrUpdate(EmergencyGuideRequest request) {
        EmergencyGuide guide = emergencyGuideRepository.findByRiskLevel(request.getRiskLevel())
                .orElse(EmergencyGuide.builder().riskLevel(request.getRiskLevel()).build());

        guide.setSteps(request.getSteps());
        guide.setEmergencyContactsInfo(request.getEmergencyContactsInfo());

        EmergencyGuide saved = emergencyGuideRepository.save(guide);
        return toResponse(saved);
    }

    private EmergencyGuideResponse toResponse(EmergencyGuide guide) {
        return EmergencyGuideResponse.builder()
                .id(guide.getId())
                .riskLevel(guide.getRiskLevel())
                .steps(guide.getSteps())
                .emergencyContactsInfo(guide.getEmergencyContactsInfo())
                .build();
    }
}