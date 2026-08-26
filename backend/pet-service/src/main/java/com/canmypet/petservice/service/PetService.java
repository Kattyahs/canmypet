package com.canmypet.petservice.service;

import com.canmypet.petservice.client.UserServiceClient;
import com.canmypet.petservice.dto.PetRequest;
import com.canmypet.petservice.dto.PetResponse;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.PetNotFoundException;
import com.canmypet.petservice.exception.UserValidationException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.repository.PetRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final UserServiceClient userServiceClient;

    public List<PetResponse> getPetsByOwner(Long ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public PetResponse createPet(PetRequest request, Long ownerId) {
        try {
            userServiceClient.getUserById(ownerId);
        } catch (FeignException.NotFound e) {
            throw new UserValidationException("Owner with id " + ownerId + " does not exist");
        } catch (FeignException e) {
            throw new UserValidationException("Could not validate owner with user-service");
        }

        Pet pet = Pet.builder()
                .name(request.getName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .weight(request.getWeight())
                .birthDate(request.getBirthDate())
                .medicalConditions(request.getMedicalConditions())
                .ownerId(ownerId)
                .build();

        Pet saved = petRepository.save(pet);
        return toResponse(saved);
    }

    public PetResponse updatePet(Long id, PetRequest request, Long ownerId) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException(id));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new ForbiddenPetAccessException();
        }

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setWeight(request.getWeight());
        pet.setBirthDate(request.getBirthDate());
        pet.setMedicalConditions(request.getMedicalConditions());

        Pet updated = petRepository.save(pet);
        return toResponse(updated);
    }

    public void deletePet(Long id, Long ownerId) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException(id));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new ForbiddenPetAccessException();
        }

        petRepository.delete(pet);
    }

    private PetResponse toResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .weight(pet.getWeight())
                .birthDate(pet.getBirthDate())
                .medicalConditions(pet.getMedicalConditions())
                .ownerId(pet.getOwnerId())
                .build();
    }
}