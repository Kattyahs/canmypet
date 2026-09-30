package com.canmypet.petservice.service;

import com.canmypet.petservice.client.UserServiceClient;
import com.canmypet.petservice.dto.PetRequest;
import com.canmypet.petservice.dto.PetResponse;
import com.canmypet.petservice.dto.UserDto;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.InvalidImageException;
import com.canmypet.petservice.exception.PhotoNotFoundException;
import com.canmypet.petservice.exception.UserValidationException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.Species;
import com.canmypet.petservice.repository.PetRepository;
import com.canmypet.petservice.storage.PhotoStorage;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    private static final String OLD_KEY = "11111111-1111-1111-1111-111111111111";
    private static final String NEW_KEY = "22222222-2222-2222-2222-222222222222";

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private ImageSanitizer imageSanitizer;

    @Mock
    private PhotoStorage photoStorage;

    @InjectMocks
    private PetService petService;

    private static Pet pet(Long id, Long ownerId, String photoKey) {
        return Pet.builder().id(id).name("Firulais").species(Species.DOG).ownerId(ownerId).photoKey(photoKey).build();
    }

    @Test
    void createPet_withValidOwner_createsAndReturnsPet() {
        PetRequest request = new PetRequest();
        request.setName("Firulais");
        request.setSpecies(Species.DOG);
        request.setBreed("Labrador");
        request.setWeight(new BigDecimal("25.5"));
        Long ownerId = 1L;

        when(userServiceClient.getUserById(ownerId)).thenReturn(new UserDto());
        when(petRepository.save(any(Pet.class))).thenReturn(pet(1L, ownerId, null));

        PetResponse response = petService.createPet(request, ownerId);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Firulais");
        assertThat(response.getOwnerId()).isEqualTo(ownerId);
        assertThat(response.isHasPhoto()).isFalse();
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void createPet_withInvalidOwner_throwsUserValidationException() {
        PetRequest request = new PetRequest();
        request.setName("Firulais");
        request.setSpecies(Species.DOG);
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
        Pet existing = pet(10L, 1L, null);
        PetRequest request = new PetRequest();
        request.setName("Firulais Actualizado");
        request.setSpecies(Species.DOG);

        when(petRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(petRepository.save(any(Pet.class))).thenReturn(existing);

        PetResponse response = petService.updatePet(10L, request, 1L);

        assertThat(response.getName()).isEqualTo("Firulais Actualizado");
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void updatePet_ownedByAnotherUser_throwsForbiddenPetAccessException() {
        PetRequest request = new PetRequest();
        request.setName("Intento de robo");
        request.setSpecies(Species.DOG);

        when(petRepository.findById(10L)).thenReturn(Optional.of(pet(10L, 1L, null)));

        assertThatThrownBy(() -> petService.updatePet(10L, request, 2L))
                .isInstanceOf(ForbiddenPetAccessException.class);
        verify(petRepository, never()).save(any(Pet.class));
    }

    @Test
    void updatePhoto_storesTheSanitizedImageAndDeletesThePreviousOne() {
        Pet existing = pet(10L, 1L, OLD_KEY);
        byte[] upload = {1, 2, 3};
        byte[] sanitized = {9, 9};

        when(petRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(imageSanitizer.sanitize(upload)).thenReturn(sanitized);
        when(photoStorage.store(sanitized)).thenReturn(NEW_KEY);
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetResponse response = petService.updatePhoto(10L, upload, 1L);

        assertThat(existing.getPhotoKey()).isEqualTo(NEW_KEY);
        assertThat(response.isHasPhoto()).isTrue();
        assertThat(response.getPhotoVersion()).isEqualTo("22222222");
        verify(photoStorage).delete(OLD_KEY);
    }

    @Test
    void updatePhoto_ofAnotherOwnersPet_isForbiddenAndStoresNothing() {
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet(10L, 1L, null)));

        assertThatThrownBy(() -> petService.updatePhoto(10L, new byte[]{1}, 2L))
                .isInstanceOf(ForbiddenPetAccessException.class);
        verifyNoInteractions(imageSanitizer, photoStorage);
    }

    @Test
    void updatePhoto_withInvalidImage_keepsThePetUnchanged() {
        Pet existing = pet(10L, 1L, OLD_KEY);
        when(petRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(imageSanitizer.sanitize(any())).thenThrow(new InvalidImageException("Only JPEG and PNG images are accepted"));

        assertThatThrownBy(() -> petService.updatePhoto(10L, new byte[]{1}, 1L))
                .isInstanceOf(InvalidImageException.class);
        assertThat(existing.getPhotoKey()).isEqualTo(OLD_KEY);
        verify(photoStorage, never()).store(any());
        verify(petRepository, never()).save(any(Pet.class));
    }

    @Test
    void getPhoto_ofAnotherOwnersPet_isForbidden() {
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet(10L, 1L, OLD_KEY)));

        assertThatThrownBy(() -> petService.getPhoto(10L, 2L)).isInstanceOf(ForbiddenPetAccessException.class);
        verify(photoStorage, never()).load(anyString());
    }

    @Test
    void getPhoto_whenThePetHasNone_throwsPhotoNotFound() {
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet(10L, 1L, null)));

        assertThatThrownBy(() -> petService.getPhoto(10L, 1L)).isInstanceOf(PhotoNotFoundException.class);
    }

    @Test
    void deletePhoto_clearsTheKeyAndDeletesTheFile() {
        Pet existing = pet(10L, 1L, OLD_KEY);
        when(petRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PetResponse response = petService.deletePhoto(10L, 1L);

        assertThat(response.isHasPhoto()).isFalse();
        assertThat(existing.getPhotoKey()).isNull();
        verify(photoStorage).delete(OLD_KEY);
    }

    @Test
    void deletePet_alsoDeletesItsPhoto() {
        Pet existing = pet(10L, 1L, OLD_KEY);
        when(petRepository.findById(10L)).thenReturn(Optional.of(existing));

        petService.deletePet(10L, 1L);

        verify(petRepository).delete(existing);
        verify(photoStorage).delete(OLD_KEY);
    }
}