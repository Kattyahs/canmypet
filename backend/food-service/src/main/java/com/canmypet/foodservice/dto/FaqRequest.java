package com.canmypet.foodservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FaqRequest {

    @NotBlank(message = "Question is required")
    private String question;
}