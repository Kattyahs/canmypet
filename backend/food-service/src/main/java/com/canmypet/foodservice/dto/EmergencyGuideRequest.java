package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmergencyGuideRequest {

    @NotNull(message = "riskLevel is required")
    private RiskLevel riskLevel;

    @NotBlank(message = "Steps are required")
    private String steps;

    private String emergencyContactsInfo;
}