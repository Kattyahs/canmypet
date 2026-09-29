package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.Species;

import java.util.List;

public record DemoContentCatalog(
        List<GuideEntry> emergencyGuides,
        List<FaqEntry> faqs,
        List<PendingEvaluationEntry> pendingEvaluations
) {

    public record GuideEntry(
            RiskLevel riskLevel,
            String steps,
            String emergencyContactsInfo
    ) {
    }

    public record FaqEntry(
            String question,
            String answer
    ) {
    }

    public record PendingEvaluationEntry(
            String food,
            Species species,
            LifeStage lifeStage,
            RiskLevel riskLevel,
            String notes,
            List<DemoFoodCatalog.SourceEntry> sources
    ) {
    }
}