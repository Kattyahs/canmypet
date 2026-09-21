package com.canmypet.foodservice.service;

import com.canmypet.foodservice.client.UserServiceClient;
import com.canmypet.foodservice.dto.FoodSafetyRequest;
import com.canmypet.foodservice.dto.FoodSafetyResponse;
import com.canmypet.foodservice.dto.UserDto;
import com.canmypet.foodservice.model.*;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodSafetyServiceTest {

    @Mock
    private FoodSafetyRepository foodSafetyRepository;

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private FoodSafetyService foodSafetyService;

    @Test
    void createFoodSafety_newCombination_createsEntry() {
        FoodSafetyRequest request = new FoodSafetyRequest();
        request.setFoodId(1L);
        request.setSpecies(Species.DOG);
        request.setRiskLevel(RiskLevel.TOXIC);

        Food food = Food.builder().id(1L).name("Chocolate").category("human food").build();

        when(foodRepository.findById(1L)).thenReturn(Optional.of(food));
        when(foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(1L, Species.DOG))
                .thenReturn(Optional.empty());

        FoodSafety savedEntry = FoodSafety.builder()
                .id(1L)
                .food(food)
                .species(Species.DOG)
                .riskLevel(RiskLevel.TOXIC)
                .verifiedStatus(VerifiedStatus.PENDING)
                .build();

        when(foodSafetyRepository.save(any(FoodSafety.class))).thenReturn(savedEntry);

        FoodSafetyResponse response = foodSafetyService.createFoodSafety(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.TOXIC);
        assertThat(response.getVerifiedStatus()).isEqualTo(VerifiedStatus.PENDING);
    }

    @Test
    void createFoodSafety_duplicateCombination_throwsIllegalStateException() {
        FoodSafetyRequest request = new FoodSafetyRequest();
        request.setFoodId(1L);
        request.setSpecies(Species.DOG);
        request.setRiskLevel(RiskLevel.TOXIC);

        Food food = Food.builder().id(1L).name("Chocolate").build();
        FoodSafety existingEntry = FoodSafety.builder().id(5L).food(food).species(Species.DOG).build();

        when(foodRepository.findById(1L)).thenReturn(Optional.of(food));
        when(foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(1L, Species.DOG))
                .thenReturn(Optional.of(existingEntry));

        assertThatThrownBy(() -> foodSafetyService.createFoodSafety(request))
                .isInstanceOf(IllegalStateException.class);

        verify(foodSafetyRepository, never()).save(any(FoodSafety.class));
    }

    @Test
    void verifyFoodSafety_withVerifiedVeterinarian_marksAsVerified() {
        Long entryId = 1L;
        Long veterinarianId = 5L;

        Food food = Food.builder().id(1L).name("Chocolate").build();
        FoodSafety entry = FoodSafety.builder()
                .id(entryId)
                .food(food)
                .species(Species.DOG)
                .riskLevel(RiskLevel.TOXIC)
                .verifiedStatus(VerifiedStatus.PENDING)
                .build();

        UserDto veterinarian = new UserDto();
        veterinarian.setRole("VETERINARIAN");
        veterinarian.setVerified(true);

        when(foodSafetyRepository.findById(entryId)).thenReturn(Optional.of(entry));
        when(userServiceClient.getUserById(veterinarianId)).thenReturn(veterinarian);
        when(foodSafetyRepository.save(any(FoodSafety.class))).thenReturn(entry);

        FoodSafetyResponse response = foodSafetyService.verifyFoodSafety(entryId, veterinarianId);

        assertThat(response.getVerifiedStatus()).isEqualTo(VerifiedStatus.VERIFIED);
        assertThat(response.getVerifiedBy()).isEqualTo(veterinarianId);
    }

    @Test
    void verifyFoodSafety_withUnverifiedVeterinarian_throwsUnauthorizedVerificationException() {
        Long entryId = 1L;
        Long unverifiedVetId = 6L;

        Food food = Food.builder().id(1L).name("Chocolate").build();
        FoodSafety entry = FoodSafety.builder()
                .id(entryId)
                .food(food)
                .species(Species.DOG)
                .verifiedStatus(VerifiedStatus.PENDING)
                .build();

        UserDto unverifiedVet = new UserDto();
        unverifiedVet.setRole("VETERINARIAN");
        unverifiedVet.setVerified(false);

        when(foodSafetyRepository.findById(entryId)).thenReturn(Optional.of(entry));
        when(userServiceClient.getUserById(unverifiedVetId)).thenReturn(unverifiedVet);

        assertThatThrownBy(() -> foodSafetyService.verifyFoodSafety(entryId, unverifiedVetId))
                .isInstanceOf(com.canmypet.foodservice.exception.UnauthorizedVerificationException.class);

        verify(foodSafetyRepository, never()).save(any(FoodSafety.class));
    }
}