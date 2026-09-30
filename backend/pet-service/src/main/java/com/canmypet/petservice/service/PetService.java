package com.canmypet.petservice.service;

import com.canmypet.petservice.client.UserServiceClient;
import com.canmypet.petservice.dto.PetRequest;
import com.canmypet.petservice.dto.PetResponse;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.PetNotFoundException;
import com.canmypet.petservice.exception.PhotoNotFoundException;
import com.canmypet.petservice.exception.UserValidationException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.repository.PetRepository;
import com.canmypet.petservice.storage.PhotoStorage;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {

    private static final int PHOTO_VERSION_LENGTH = 8;

    private final PetRepository petRepository;
    private final UserServiceClient userServiceClient;
    private final ImageSanitizer imageSanitizer;
    private final PhotoStorage photoStorage;

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
                .lifeStage(request.getLifeStage())
                .medicalConditions(request.getMedicalConditions())
                .ownerId(ownerId)
                .build();

        Pet saved = petRepository.save(pet);
        return toResponse(saved);
    }

    public PetResponse updatePet(Long id, PetRequest request, Long ownerId) {
        Pet pet = findOwnedPet(id, ownerId);

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setWeight(request.getWeight());
        pet.setBirthDate(request.getBirthDate());
        pet.setLifeStage(request.getLifeStage());
        pet.setMedicalConditions(request.getMedicalConditions());

        Pet updated = petRepository.save(pet);
        return toResponse(updated);
    }

    public void deletePet(Long id, Long ownerId) {
        Pet pet = findOwnedPet(id, ownerId);
        String photoKey = pet.getPhotoKey();

        petRepository.delete(pet);

        if (photoKey != null) {
            photoStorage.delete(photoKey);
        }
    }

    public PetResponse updatePhoto(Long id, byte[] content, Long ownerId) {
        Pet pet = findOwnedPet(id, ownerId);
        byte[] sanitized = imageSanitizer.sanitize(content);
        String previousKey = pet.getPhotoKey();

        pet.setPhotoKey(photoStorage.store(sanitized));
        Pet saved = petRepository.save(pet);

        if (previousKey != null) {
            photoStorage.delete(previousKey);
        }
        return toResponse(saved);
    }

    public byte[] getPhoto(Long id, Long ownerId) {
        Pet pet = findOwnedPet(id, ownerId);
        if (pet.getPhotoKey() == null) {
            throw new PhotoNotFoundException(id);
        }
        return photoStorage.load(pet.getPhotoKey());
    }

    public PetResponse deletePhoto(Long id, Long ownerId) {
        Pet pet = findOwnedPet(id, ownerId);
        String photoKey = pet.getPhotoKey();

        pet.setPhotoKey(null);
        Pet saved = petRepository.save(pet);

        if (photoKey != null) {
            photoStorage.delete(photoKey);
        }
        return toResponse(saved);
    }

    private Pet findOwnedPet(Long id, Long ownerId) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException(id));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new ForbiddenPetAccessException();
        }
        return pet;
    }

    private PetResponse toResponse(Pet pet) {
        String photoKey = pet.getPhotoKey();
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .weight(pet.getWeight())
                .birthDate(pet.getBirthDate())
                .lifeStage(pet.getLifeStage())
                .medicalConditions(pet.getMedicalConditions())
                .ownerId(pet.getOwnerId())
                .hasPhoto(photoKey != null)
                .photoVersion(photoKey == null ? null : photoKey.substring(0, Math.min(PHOTO_VERSION_LENGTH, photoKey.length())))
                .build();
    }
}