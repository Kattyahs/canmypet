package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.dto.FoodSafetyRequest;
import com.canmypet.foodservice.dto.FoodSafetyResponse;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.security.JwtPrincipal;
import com.canmypet.foodservice.service.FoodSafetyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.canmypet.foodservice.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;


@RestController
@RequestMapping("/api/food-safety")
@RequiredArgsConstructor
public class FoodSafetyController {

    private final FoodSafetyService foodSafetyService;

    @GetMapping
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<PageResponse<FoodSafetyResponse>> getByStatus(
            @RequestParam VerifiedStatus status,
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(foodSafetyService.getByStatus(status, pageable));
    }

    @GetMapping("/{foodId}")
    public ResponseEntity<List<FoodSafetyResponse>> getByFood(@PathVariable Long foodId) {
        return ResponseEntity.ok(foodSafetyService.getByFood(foodId));
    }

    @GetMapping("/{foodId}/{species}")
    public ResponseEntity<List<FoodSafetyResponse>> getByFoodAndSpecies(
            @PathVariable Long foodId,
            @PathVariable Species species,
            @RequestParam(required = false) LifeStage lifeStage
    ) {
        return ResponseEntity.ok(foodSafetyService.getByFoodAndSpecies(foodId, species, lifeStage));
    }

    @PostMapping
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<FoodSafetyResponse> createFoodSafety(
            @Valid @RequestBody FoodSafetyRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        FoodSafetyResponse response =
                foodSafetyService.createFoodSafety(request, principal.userId(), principal.role());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('VETERINARIAN') or hasRole('ADMIN')")
    public ResponseEntity<FoodSafetyResponse> verifyFoodSafety(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        FoodSafetyResponse response = foodSafetyService.verifyFoodSafety(id, principal.userId());
        return ResponseEntity.ok(response);
    }
}