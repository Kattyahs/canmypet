package com.canmypet.foodservice.dto;

import com.canmypet.foodservice.model.FaqStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class FaqResponse {
    private Long id;
    private String question;
    private String answer;
    private Long askedBy;
    private Long answeredBy;
    private FaqStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;
}