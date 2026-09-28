package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.publicapi.PublicEvaluation;
import com.canmypet.foodservice.dto.publicapi.PublicFoodResult;
import com.canmypet.foodservice.dto.publicapi.PublicFoodSafetySearchResponse;
import com.canmypet.foodservice.dto.publicapi.PublicSource;
import com.canmypet.foodservice.exception.InvalidPublicParameterException;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicFoodService {

    static final int MIN_QUERY_LENGTH = 2;
    static final int MAX_QUERY_LENGTH = 100;

    private static final Pageable SUGGESTIONS = PageRequest.of(0, 10, Sort.by("name"));

    private final FoodRepository foodRepository;
    private final FoodSafetyRepository foodSafetyRepository;

    @Transactional(readOnly = true)
    public PublicFoodSafetySearchResponse searchWithSafety(String query, Species species, LifeStage lifeStage) {
        String normalizedQuery = validateQuery(query);

        List<Food> foods = foodRepository.findByNameContainingIgnoreCase(normalizedQuery, SUGGESTIONS);
        if (foods.isEmpty()) {
            return new PublicFoodSafetySearchResponse(species, lifeStage, List.of());
        }

        List<Long> foodIds = foods.stream().map(Food::getId).toList();
        Map<Long, List<FoodSafety>> entriesByFood = foodSafetyRepository
                .findByFoodIdInAndSpeciesAndVerifiedStatus(foodIds, species, VerifiedStatus.VERIFIED)
                .stream()
                .collect(Collectors.groupingBy(entry -> entry.getFood().getId()));

        List<PublicFoodResult> results = foods.stream()
                .map(food -> toResult(food, selectEntry(entriesByFood.getOrDefault(food.getId(), List.of()), lifeStage)))
                .toList();

        return new PublicFoodSafetySearchResponse(species, lifeStage, results);
    }

    private String validateQuery(String query) {
        String trimmed = query == null ? "" : query.trim();
        if (trimmed.length() < MIN_QUERY_LENGTH || trimmed.length() > MAX_QUERY_LENGTH) {
            throw new InvalidPublicParameterException(
                    "query must be between " + MIN_QUERY_LENGTH + " and " + MAX_QUERY_LENGTH + " characters");
        }
        return trimmed;
    }

    private FoodSafety selectEntry(List<FoodSafety> entries, LifeStage lifeStage) {
        if (lifeStage != null) {
            Optional<FoodSafety> specific = entries.stream()
                    .filter(entry -> entry.getLifeStage() == lifeStage)
                    .findFirst();
            if (specific.isPresent()) {
                return specific.get();
            }
        }
        return entries.stream()
                .filter(entry -> entry.getLifeStage() == null)
                .findFirst()
                .orElse(null);
    }

    private PublicFoodResult toResult(Food food, FoodSafety entry) {
        return new PublicFoodResult(
                food.getId(),
                food.getName(),
                food.getCategory(),
                entry == null ? null : toEvaluation(entry));
    }

    private PublicEvaluation toEvaluation(FoodSafety entry) {
        List<PublicSource> sources = entry.getSources() == null
                ? List.of()
                : entry.getSources().stream()
                .map(source -> new PublicSource(source.getSourceName(), source.getSourceUrl()))
                .toList();

        return new PublicEvaluation(entry.getLifeStage(), entry.getRiskLevel(), entry.getNotes(), sources);
    }
}