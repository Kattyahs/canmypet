package com.canmypet.petservice.dto;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Species;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchHistoryRequest {

    private Long petId;

    @NotNull(message = "foodId is required")
    private Long foodId;

    private Species species;

    private LifeStage lifeStage;

    @JsonIgnore
    @AssertTrue(message = "lifeStage requires species")
    public boolean isLifeStageWithSpecies() {
        return lifeStage == null || species != null;
    }
}