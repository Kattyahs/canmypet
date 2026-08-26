package com.canmypet.petservice.repository;

import com.canmypet.petservice.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);
}