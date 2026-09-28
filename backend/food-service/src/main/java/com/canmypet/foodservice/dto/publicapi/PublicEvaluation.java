package com.canmypet.foodservice.dto.publicapi;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;

import java.util.List;

public record PublicEvaluation(
        LifeStage lifeStage,
        RiskLevel riskLevel,
        String notes,
        List<PublicSource> sources
) {
}