package com.canmypet.petservice.dto;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Species;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SearchHistoryResponse {
    private Long id;
    private Long userId;
    private Long petId;
    private Long foodId;
    private Species species;
    private LifeStage lifeStage;
    private LocalDateTime searchedAt;
}