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

import java.util.List;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping
    public ResponseEntity<List<FaqResponse>> getAllFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqs());
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