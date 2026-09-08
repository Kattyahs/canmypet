package com.canmypet.foodservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FaqAnswerRequest {

    @NotBlank(message = "Answer is required")
    private String answer;
}