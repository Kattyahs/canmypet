package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class EmergencyGuideResponse {
    private Long id;
    private RiskLevel riskLevel;
    private String steps;
    private String emergencyContactsInfo;
}