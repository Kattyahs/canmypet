package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.Species;
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

    @NotNull(message = "species is required")
    private Species species;

    private LifeStage lifeStage;

    @NotNull(message = "riskLevel is required")
    private RiskLevel riskLevel;

    private String notes;

    @Valid
    private List<SourceRequest> sources;
}