package com.canmypet.petservice.seed;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.Species;
import com.canmypet.petservice.repository.PetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoPetSeederTest {

    @Mock
    private PetRepository petRepository;

    @Test
    @SuppressWarnings("unchecked")
    void run_whenDemoOwnerHasNoPets_createsDogAndCat() {
        when(petRepository.findByOwnerId(DemoPetSeeder.DEMO_OWNER_ID)).thenReturn(List.of());
        when(petRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        new DemoPetSeeder(petRepository).run();

        ArgumentCaptor<List<Pet>> saved = ArgumentCaptor.forClass(List.class);
        verify(petRepository).saveAll(saved.capture());
        assertThat(saved.getValue())
                .extracting(Pet::getName, Pet::getSpecies, Pet::getLifeStage, Pet::getOwnerId)
                .containsExactly(
                        tuple("Popi", Species.DOG, LifeStage.ADULT, DemoPetSeeder.DEMO_OWNER_ID),
                        tuple("Michi", Species.CAT, LifeStage.SENIOR, DemoPetSeeder.DEMO_OWNER_ID));
    }

    @Test
    void run_whenDemoOwnerAlreadyHasPets_doesNothing() {
        when(petRepository.findByOwnerId(DemoPetSeeder.DEMO_OWNER_ID)).thenReturn(List.of(new Pet()));

        new DemoPetSeeder(petRepository).run();

        verify(petRepository, never()).saveAll(anyList());
    }
}