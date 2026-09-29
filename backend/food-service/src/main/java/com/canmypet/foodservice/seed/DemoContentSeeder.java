package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.EmergencyGuide;
import com.canmypet.foodservice.model.Faq;
import com.canmypet.foodservice.model.FaqStatus;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.Source;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.EmergencyGuideRepository;
import com.canmypet.foodservice.repository.FaqRepository;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("dev")
@Order(2)
@RequiredArgsConstructor
public class DemoContentSeeder implements CommandLineRunner {

    static final Long DEMO_OWNER_ID = 9001L;
    static final Long DEMO_VETERINARIAN_ID = 9002L;
    static final String CONTENT_PATH = "seed/demo-content.json";

    private final EmergencyGuideRepository emergencyGuideRepository;
    private final FaqRepository faqRepository;
    private final FoodRepository foodRepository;
    private final FoodSafetyRepository foodSafetyRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws IOException {
        DemoContentCatalog content = loadContent();

        int guides = seedEmergencyGuides(content.emergencyGuides());
        int faqs = seedFaqs(content.faqs());
        int pending = seedPendingEvaluations(content.pendingEvaluations());

        log.info("Demo content seed: {} emergency guides, {} FAQs and {} pending evaluations created",
                guides, faqs, pending);
    }

    DemoContentCatalog loadContent() throws IOException {
        try (InputStream input = new ClassPathResource(CONTENT_PATH).getInputStream()) {
            return objectMapper.readValue(input, DemoContentCatalog.class);
        }
    }

    private int seedEmergencyGuides(List<DemoContentCatalog.GuideEntry> entries) {
        int created = 0;
        for (DemoContentCatalog.GuideEntry entry : entries) {
            if (emergencyGuideRepository.findByRiskLevel(entry.riskLevel()).isPresent()) {
                continue;
            }
            emergencyGuideRepository.save(EmergencyGuide.builder()
                    .riskLevel(entry.riskLevel())
                    .steps(entry.steps())
                    .emergencyContactsInfo(entry.emergencyContactsInfo())
                    .build());
            created++;
        }
        return created;
    }

    private int seedFaqs(List<DemoContentCatalog.FaqEntry> entries) {
        if (faqRepository.count() > 0) {
            return 0;
        }
        faqRepository.saveAll(entries.stream().map(this::toFaq).toList());
        return entries.size();
    }

    private Faq toFaq(DemoContentCatalog.FaqEntry entry) {
        boolean answered = entry.answer() != null;
        return Faq.builder()
                .question(entry.question())
                .answer(entry.answer())
                .askedBy(DEMO_OWNER_ID)
                .answeredBy(answered ? DEMO_VETERINARIAN_ID : null)
                .status(answered ? FaqStatus.ANSWERED : FaqStatus.PENDING)
                .answeredAt(answered ? LocalDateTime.now() : null)
                .build();
    }

    private int seedPendingEvaluations(List<DemoContentCatalog.PendingEvaluationEntry> entries) {
        int created = 0;
        for (DemoContentCatalog.PendingEvaluationEntry entry : entries) {
            Optional<Food> food = foodRepository.findByNameIgnoreCase(entry.food());
            if (food.isEmpty()) {
                log.warn("Food '{}' not found. Pending evaluation for {} was not created.", entry.food(), entry.species());
                continue;
            }
            if (evaluationExists(food.get(), entry)) {
                continue;
            }
            foodSafetyRepository.save(toPendingEvaluation(food.get(), entry));
            created++;
        }
        return created;
    }

    private boolean evaluationExists(Food food, DemoContentCatalog.PendingEvaluationEntry entry) {
        if (entry.lifeStage() == null) {
            return foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(food.getId(), entry.species()).isPresent();
        }
        return foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStage(food.getId(), entry.species(), entry.lifeStage())
                .isPresent();
    }

    private FoodSafety toPendingEvaluation(Food food, DemoContentCatalog.PendingEvaluationEntry entry) {
        FoodSafety foodSafety = FoodSafety.builder()
                .food(food)
                .species(entry.species())
                .lifeStage(entry.lifeStage())
                .riskLevel(entry.riskLevel())
                .notes(entry.notes())
                .verifiedStatus(VerifiedStatus.PENDING)
                .build();

        foodSafety.setSources(entry.sources().stream()
                .map(source -> Source.builder()
                        .foodSafety(foodSafety)
                        .sourceName(source.name())
                        .sourceUrl(source.url())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new)));

        return foodSafety;
    }
}