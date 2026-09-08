package com.canmypet.petservice.dto;

import com.canmypet.petservice.model.LifeStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class PetResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private BigDecimal weight;
    private LocalDate birthDate;
    private LifeStage lifeStage;
    private String medicalConditions;
    private Long ownerId;
}