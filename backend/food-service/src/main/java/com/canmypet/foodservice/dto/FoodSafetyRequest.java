package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FoodSafetyRequest {

    @NotNull(message = "foodId is required")
    private Long foodId;

    @NotBlank(message = "Species is required")
    private String species;

    // Optional: null means "applies to all life stages"
    private LifeStage lifeStage;

    @NotNull(message = "riskLevel is required")
    private RiskLevel riskLevel;

    private String notes;

    @Valid
    private List<SourceRequest> sources;
}