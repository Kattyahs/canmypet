package com.canmypet.petservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PetRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String breed;

    @Positive(message = "Weight must be positive")
    private BigDecimal weight;

    private LocalDate birthDate;

    private String medicalConditions;
}
