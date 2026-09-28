package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.Species;

import java.util.List;

public record DemoFoodCatalog(List<FoodEntry> foods) {

    public record FoodEntry(
            String name,
            String category,
            String description,
            List<EvaluationEntry> evaluations
    ) {
    }

    public record EvaluationEntry(
            Species species,
            LifeStage lifeStage,
            RiskLevel riskLevel,
            String notes,
            List<SourceEntry> sources
    ) {
    }

    public record SourceEntry(
            String name,
            String url
    ) {
    }
}
