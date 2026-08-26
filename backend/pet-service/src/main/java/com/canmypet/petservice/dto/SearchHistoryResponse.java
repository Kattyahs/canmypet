package com.canmypet.petservice.dto;

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
    private LocalDateTime searchedAt;
}