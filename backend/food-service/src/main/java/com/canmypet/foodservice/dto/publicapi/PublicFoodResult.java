package com.canmypet.foodservice.dto.publicapi;

public record PublicFoodResult(
        Long foodId,
        String foodName,
        String category,
        PublicEvaluation evaluation
) {
}