package com.canmypet.petservice.service;

import com.canmypet.petservice.client.UserServiceClient;
import com.canmypet.petservice.dto.PetRequest;
import com.canmypet.petservice.dto.PetResponse;
import com.canmypet.petservice.dto.UserDto;
import com.canmypet.petservice.exception.UserValidationException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.repository.PetRepository;
import feign.FeignException;
import feign.Request;
import feign.Request.HttpMethod;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private PetService petService;

    @Test
    void createPet_withValidOwner_createsAndReturnsPet() {
        // Arrange
        PetRequest request = new PetRequest();
        request.setName("Firulais");
        request.setSpecies("dog");
        request.setBreed("Labrador");
        request.setWeight(new BigDecimal("25.5"));

        Long ownerId = 1L;

        when(userServiceClient.getUserById(ownerId)).thenReturn(new UserDto());

        Pet savedPet = Pet.builder()
                .id(1L)
                .name("Firulais")
                .species("dog")
                .breed("Labrador")
                .weight(new BigDecimal("25.5"))
                .ownerId(ownerId)
                .build();

        when(petRepository.save(any(Pet.class))).thenReturn(savedPet);

        // Act
        PetResponse response = petService.createPet(request, ownerId);

        // Assert
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Firulais");
        assertThat(response.getOwnerId()).isEqualTo(ownerId);

        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void createPet_withInvalidOwner_throwsUserValidationException() {
        PetRequest request = new PetRequest();
        request.setName("Firulais");
        request.setSpecies("dog");

        Long ownerId = 999L;

        Request feignRequest = Request.create(HttpMethod.GET, "/api/users/999",
                Collections.emptyMap(), null, StandardCharsets.UTF_8, null);

        when(userServiceClient.getUserById(ownerId))
                .thenThrow(new FeignException.NotFound("Not Found", feignRequest, null, null));

        assertThatThrownBy(() -> petService.createPet(request, ownerId))
                .isInstanceOf(UserValidationException.class);

        verify(petRepository, never()).save(any(Pet.class));
    }

    @Test
    void updatePet_ownedByUser_updatesAndReturnsPet() {
        Long ownerId = 1L;
        Long petId = 10L;

        Pet existingPet = Pet.builder()
                .id(petId)
                .name("Firulais")
                .species("dog")
                .ownerId(ownerId)
                .build();

        PetRequest request = new PetRequest();
        request.setName("Firulais Actualizado");
        request.setSpecies("dog");

        when(petRepository.findById(petId)).thenReturn(java.util.Optional.of(existingPet));
        when(petRepository.save(any(Pet.class))).thenReturn(existingPet);

        PetResponse response = petService.updatePet(petId, request, ownerId);

        assertThat(response.getName()).isEqualTo("Firulais Actualizado");
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void updatePet_ownedByAnotherUser_throwsForbiddenPetAccessException() {
        Long realOwnerId = 1L;
        Long attackerId = 2L;
        Long petId = 10L;

        Pet existingPet = Pet.builder()
                .id(petId)
                .name("Firulais")
                .species("dog")
                .ownerId(realOwnerId)
                .build();

        PetRequest request = new PetRequest();
        request.setName("Intento de robo");
        request.setSpecies("dog");

        when(petRepository.findById(petId)).thenReturn(java.util.Optional.of(existingPet));

        assertThatThrownBy(() -> petService.updatePet(petId, request, attackerId))
                .isInstanceOf(com.canmypet.petservice.exception.ForbiddenPetAccessException.class);

        verify(petRepository, never()).save(any(Pet.class));
    }
}