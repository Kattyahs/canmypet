package com.canmypet.foodservice.service;

import com.canmypet.foodservice.client.UserServiceClient;
import com.canmypet.foodservice.dto.*;
import com.canmypet.foodservice.exception.FoodNotFoundException;
import com.canmypet.foodservice.exception.FoodSafetyNotFoundException;
import com.canmypet.foodservice.exception.UnauthorizedVerificationException;
import com.canmypet.foodservice.model.*;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodSafetyService {

    private final FoodSafetyRepository foodSafetyRepository;
    private final FoodRepository foodRepository;
    private final UserServiceClient userServiceClient;

    public List<FoodSafetyResponse> getByFoodAndSpecies(Long foodId, Species species, LifeStage lifeStage) {
        if (lifeStage == null) {
            // No lifeStage specified: return ALL entries for this food+species
            List<FoodSafety> all = foodSafetyRepository.findByFoodIdAndSpecies(foodId, species);
            if (all.isEmpty()) {
                throw new FoodSafetyNotFoundException(foodId, species);
            }
            return all.stream().map(this::toResponse).toList();
        }

        // lifeStage specified: look for the specific entry first
        var specific = foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStage(foodId, species, lifeStage);
        if (specific.isPresent()) {
            return List.of(toResponse(specific.get()));
        }

        // Fall back to the general entry
        FoodSafety general = foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(foodId, species)
                .orElseThrow(() -> new FoodSafetyNotFoundException(foodId, species));

        return List.of(toResponse(general));
    }
    public FoodSafetyResponse createFoodSafety(FoodSafetyRequest request) {
        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new FoodNotFoundException(request.getFoodId()));

        if (request.getLifeStage() == null) {
            foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(request.getFoodId(), request.getSpecies())
                    .ifPresent(existing -> {
                        throw new IllegalStateException(
                                "A general FoodSafety entry already exists for this food and species");
                    });
        } else {
            foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStage(
                            request.getFoodId(), request.getSpecies(), request.getLifeStage())
                    .ifPresent(existing -> {
                        throw new IllegalStateException(
                                "A FoodSafety entry already exists for this food, species and life stage");
                    });
        }

        FoodSafety entry = FoodSafety.builder()
                .food(food)
                .species(request.getSpecies())
                .lifeStage(request.getLifeStage())
                .riskLevel(request.getRiskLevel())
                .notes(request.getNotes())
                .verifiedStatus(VerifiedStatus.PENDING)
                .build();

        if (request.getSources() != null) {
            List<Source> sources = request.getSources().stream()
                    .map(s -> Source.builder()
                            .foodSafety(entry)
                            .sourceName(s.getSourceName())
                            .sourceUrl(s.getSourceUrl())
                            .build())
                    .toList();
            entry.setSources(sources);
        }

        FoodSafety saved = foodSafetyRepository.save(entry);
        return toResponse(saved);
    }

    public FoodSafetyResponse verifyFoodSafety(Long id, Long verifierId) {
        FoodSafety entry = foodSafetyRepository.findById(id)
                .orElseThrow(() -> new FoodSafetyNotFoundException(id));

        UserDto verifier;
        try {
            verifier = userServiceClient.getUserById(verifierId);
        } catch (FeignException e) {
            throw new UnauthorizedVerificationException("Could not validate verifier with user-service");
        }

        if (!"VETERINARIAN".equals(verifier.getRole()) || !Boolean.TRUE.equals(verifier.getVerified())) {
            throw new UnauthorizedVerificationException(
                    "Only verified veterinarians can verify a FoodSafety entry");
        }

        entry.setVerifiedBy(verifierId);
        entry.setVerifiedStatus(VerifiedStatus.VERIFIED);

        FoodSafety updated = foodSafetyRepository.save(entry);
        return toResponse(updated);
    }

    private FoodSafetyResponse toResponse(FoodSafety entry) {
        List<SourceResponse> sources = entry.getSources() == null
                ? List.of()
                : entry.getSources().stream()
                .map(s -> SourceResponse.builder()
                        .id(s.getId())
                        .sourceName(s.getSourceName())
                        .sourceUrl(s.getSourceUrl())
                        .build())
                .toList();

        return FoodSafetyResponse.builder()
                .id(entry.getId())
                .foodId(entry.getFood().getId())
                .foodName(entry.getFood().getName())
                .species(entry.getSpecies())
                .lifeStage(entry.getLifeStage())
                .riskLevel(entry.getRiskLevel())
                .notes(entry.getNotes())
                .verifiedBy(entry.getVerifiedBy())
                .verifiedStatus(entry.getVerifiedStatus())
                .sources(sources)
                .build();
    }
}