package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class FoodSafetyResponse {
    private Long id;
    private Long foodId;
    private String foodName;
    private Species species;
    private LifeStage lifeStage;
    private RiskLevel riskLevel;
    private String notes;
    private Long verifiedBy;
    private VerifiedStatus verifiedStatus;
    private List<SourceResponse> sources;
}