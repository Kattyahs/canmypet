package com.canmypet.petservice.dto;

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
    private String medicalConditions;
    private Long ownerId;
}