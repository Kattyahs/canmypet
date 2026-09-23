package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.dto.FaqAnswerRequest;
import com.canmypet.foodservice.dto.FaqRequest;
import com.canmypet.foodservice.dto.FaqResponse;
import com.canmypet.foodservice.security.JwtPrincipal;
import com.canmypet.foodservice.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.canmypet.foodservice.dto.PageResponse;
import com.canmypet.foodservice.model.FaqStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<PageResponse<FaqResponse>> getFaqs(
            @RequestParam(required = false) FaqStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(faqService.getFaqs(status, pageable));
    }

    @PostMapping
    public ResponseEntity<FaqResponse> askQuestion(
            @Valid @RequestBody FaqRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        FaqResponse response = faqService.askQuestion(request, principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/answer")
    @PreAuthorize("hasRole('VETERINARIAN')")
    public ResponseEntity<FaqResponse> answerQuestion(
            @PathVariable Long id,
            @Valid @RequestBody FaqAnswerRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        FaqResponse response = faqService.answerQuestion(id, request, principal.userId());
        return ResponseEntity.ok(response);
    }
}