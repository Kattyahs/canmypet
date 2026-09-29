package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.Source;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.annotation.Order;


import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("dev")
@Order(1)
@RequiredArgsConstructor
public class DemoFoodSeeder implements CommandLineRunner {

    static final Long DEMO_VETERINARIAN_ID = 9002L;
    static final String CATALOG_PATH = "seed/demo-foods.json";

    private final FoodRepository foodRepository;
    private final FoodSafetyRepository foodSafetyRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws IOException {
        List<DemoFoodCatalog.FoodEntry> entries = loadCatalog().foods();
        int created = 0;

        for (DemoFoodCatalog.FoodEntry entry : entries) {
            if (foodRepository.existsByNameIgnoreCase(entry.name())) {
                continue;
            }
            Food food = foodRepository.save(Food.builder()
                    .name(entry.name())
                    .category(entry.category())
                    .description(entry.description())
                    .build());
            entry.evaluations().forEach(evaluation -> foodSafetyRepository.save(toFoodSafety(food, evaluation)));
            created++;
        }

        log.info("Demo food seed: {} foods created, {} already present", created, entries.size() - created);
    }

    DemoFoodCatalog loadCatalog() throws IOException {
        try (InputStream input = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readValue(input, DemoFoodCatalog.class);
        }
    }

    private FoodSafety toFoodSafety(Food food, DemoFoodCatalog.EvaluationEntry evaluation) {
        FoodSafety foodSafety = FoodSafety.builder()
                .food(food)
                .species(evaluation.species())
                .lifeStage(evaluation.lifeStage())
                .riskLevel(evaluation.riskLevel())
                .notes(evaluation.notes())
                .verifiedBy(DEMO_VETERINARIAN_ID)
                .verifiedStatus(VerifiedStatus.VERIFIED)
                .build();

        foodSafety.setSources(evaluation.sources().stream()
                .map(source -> Source.builder()
                        .foodSafety(foodSafety)
                        .sourceName(source.name())
                        .sourceUrl(source.url())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new)));

        return foodSafety;
    }
}
