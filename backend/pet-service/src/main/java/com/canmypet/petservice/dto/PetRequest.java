package com.canmypet.petservice.dto;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Species;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PetRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Species is required")
    private Species species;

    private String breed;

    @Positive(message = "Weight must be positive")
    private BigDecimal weight;

    @PastOrPresent(message = "birthDate cannot be in the future")
    private LocalDate birthDate;

    private LifeStage lifeStage;

    private String medicalConditions;
}
