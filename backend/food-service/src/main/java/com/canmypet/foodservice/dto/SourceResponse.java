package com.canmypet.foodservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SourceResponse {
    private Long id;
    private String sourceName;
    private String sourceUrl;
}