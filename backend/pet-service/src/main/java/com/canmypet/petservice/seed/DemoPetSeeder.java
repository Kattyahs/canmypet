package com.canmypet.petservice.seed;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.Species;
import com.canmypet.petservice.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DemoPetSeeder implements CommandLineRunner {

    static final Long DEMO_OWNER_ID = 9001L;

    private final PetRepository petRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (!petRepository.findByOwnerId(DEMO_OWNER_ID).isEmpty()) {
            return;
        }

        List<Pet> pets = petRepository.saveAll(demoPets());
        log.info("Demo pets: {} pets created for owner {}", pets.size(), DEMO_OWNER_ID);
    }

    List<Pet> demoPets() {
        return List.of(
                Pet.builder()
                        .name("Popi")
                        .species(Species.DOG)
                        .breed("Mestizo")
                        .weight(new BigDecimal("12.5"))
                        .birthDate(LocalDate.of(2021, 3, 15))
                        .lifeStage(LifeStage.ADULT)
                        .ownerId(DEMO_OWNER_ID)
                        .build(),
                Pet.builder()
                        .name("Michi")
                        .species(Species.CAT)
                        .breed("Doméstico de pelo corto")
                        .weight(new BigDecimal("4.2"))
                        .birthDate(LocalDate.of(2013, 6, 1))
                        .lifeStage(LifeStage.SENIOR)
                        .ownerId(DEMO_OWNER_ID)
                        .build());
    }
}