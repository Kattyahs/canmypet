package com.canmypet.petservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchHistoryRequest {

    private Long petId;

    @NotNull(message = "foodId is required")
    private Long foodId;
}