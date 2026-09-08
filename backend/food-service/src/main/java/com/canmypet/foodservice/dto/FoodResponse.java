package com.canmypet.foodservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FoodResponse {
    private Long id;
    private String name;
    private String category;
    private String description;
}