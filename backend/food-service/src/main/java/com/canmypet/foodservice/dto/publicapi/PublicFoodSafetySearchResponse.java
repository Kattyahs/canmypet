package com.canmypet.foodservice.dto.publicapi;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;

import java.util.List;

public record PublicFoodSafetySearchResponse(
        Species species,
        LifeStage lifeStage,
        List<PublicFoodResult> results
) {
}