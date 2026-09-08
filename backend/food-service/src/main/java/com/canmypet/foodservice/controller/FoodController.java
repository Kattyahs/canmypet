package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.dto.FoodRequest;
import com.canmypet.foodservice.dto.FoodResponse;
import com.canmypet.foodservice.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> searchFoods(@RequestParam String query) {
        return ResponseEntity.ok(foodService.searchFoods(query));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> createFood(@Valid @RequestBody FoodRequest request) {
        FoodResponse response = foodService.createFood(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}