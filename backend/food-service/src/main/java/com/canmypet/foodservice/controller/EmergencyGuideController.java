package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.dto.EmergencyGuideRequest;
import com.canmypet.foodservice.dto.EmergencyGuideResponse;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.service.EmergencyGuideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyGuideController {

    private final EmergencyGuideService emergencyGuideService;

    @GetMapping("/{riskLevel}")
    public ResponseEntity<EmergencyGuideResponse> getByRiskLevel(@PathVariable RiskLevel riskLevel) {
        return ResponseEntity.ok(emergencyGuideService.getByRiskLevel(riskLevel));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmergencyGuideResponse> createOrUpdate(@Valid @RequestBody EmergencyGuideRequest request) {
        return ResponseEntity.ok(emergencyGuideService.createOrUpdate(request));
    }
}