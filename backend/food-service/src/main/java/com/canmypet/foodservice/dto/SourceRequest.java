package com.canmypet.foodservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SourceRequest {

    @NotBlank(message = "Source name is required")
    private String sourceName;

    private String sourceUrl;
}