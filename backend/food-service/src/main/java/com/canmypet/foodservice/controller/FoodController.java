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
import com.canmypet.foodservice.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private static final int MAX_IDS_PER_LOOKUP = 100;

    @GetMapping
    public ResponseEntity<PageResponse<FoodResponse>> getAllFoods(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ResponseEntity.ok(foodService.getAllFoods(query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> searchFoods(@RequestParam String query) {
        return ResponseEntity.ok(foodService.searchFoods(query));
    }


    @GetMapping("/by-ids")
    public ResponseEntity<List<FoodResponse>> getFoodsByIds(@RequestParam List<Long> ids) {
        if (ids.size() > MAX_IDS_PER_LOOKUP) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "At most " + MAX_IDS_PER_LOOKUP + " ids per request");
        }
        return ResponseEntity.ok(foodService.getFoodsByIds(ids));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> createFood(@Valid @RequestBody FoodRequest request) {
        FoodResponse response = foodService.createFood(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> updateFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodRequest request
    ) {
        return ResponseEntity.ok(foodService.updateFood(id, request));
    }
}