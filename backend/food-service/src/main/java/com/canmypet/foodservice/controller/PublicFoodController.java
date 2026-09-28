package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.dto.publicapi.PublicFoodSafetySearchResponse;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.service.PublicFoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/v1/foods")
@RequiredArgsConstructor
@Tag(name = "Public API", description = "Read-only food safety lookups for external consumers. The X-API-Key header is validated by the api-gateway")
public class PublicFoodController {

    private final PublicFoodService publicFoodService;

    @GetMapping("/safety")
    @SecurityRequirements
    @Operation(summary = "Search foods by name and return their verified risk level for a species")
    public ResponseEntity<PublicFoodSafetySearchResponse> searchWithSafety(
            @RequestParam String query,
            @RequestParam Species species,
            @RequestParam(required = false) LifeStage lifeStage
    ) {
        return ResponseEntity.ok(publicFoodService.searchWithSafety(query, species, lifeStage));
    }
}