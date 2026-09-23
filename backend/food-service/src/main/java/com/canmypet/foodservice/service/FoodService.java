package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.FoodRequest;
import com.canmypet.foodservice.dto.FoodResponse;
import com.canmypet.foodservice.exception.FoodNotFoundException;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.canmypet.foodservice.dto.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private static final int SUGGESTION_LIMIT = 10;

    private final FoodRepository foodRepository;

    public PageResponse<FoodResponse> getAllFoods(Pageable pageable) {
        return PageResponse.from(foodRepository.findAll(pageable), this::toResponse);
    }

    public FoodResponse getFoodById(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new FoodNotFoundException(id));
        return toResponse(food);
    }

    public List<FoodResponse> searchFoods(String query) {
        return foodRepository
                .findByNameContainingIgnoreCase(query, PageRequest.of(0, SUGGESTION_LIMIT))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FoodResponse createFood(FoodRequest request) {
        Food food = Food.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        Food saved = foodRepository.save(food);
        return toResponse(saved);
    }

    private FoodResponse toResponse(Food food) {
        return FoodResponse.builder()
                .id(food.getId())
                .name(food.getName())
                .category(food.getCategory())
                .description(food.getDescription())
                .build();
    }
}