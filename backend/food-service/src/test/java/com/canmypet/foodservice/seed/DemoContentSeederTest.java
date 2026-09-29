package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.EmergencyGuide;
import com.canmypet.foodservice.model.Faq;
import com.canmypet.foodservice.model.FaqStatus;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.EmergencyGuideRepository;
import com.canmypet.foodservice.repository.FaqRepository;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoContentSeederTest {

    @Mock
    private EmergencyGuideRepository emergencyGuideRepository;

    @Mock
    private FaqRepository faqRepository;

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private FoodSafetyRepository foodSafetyRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DemoContentSeeder seeder;
    private DemoContentCatalog content;

    @BeforeEach
    void setUp() throws Exception {
        seeder = new DemoContentSeeder(
                emergencyGuideRepository, faqRepository, foodRepository, foodSafetyRepository, objectMapper);
        content = seeder.loadContent();
    }

    @Test
    void content_hasOneGuidePerDangerousRiskLevel() {
        assertThat(content.emergencyGuides())
                .extracting(DemoContentCatalog.GuideEntry::riskLevel)
                .containsExactlyInAnyOrder(RiskLevel.MODERATE, RiskLevel.TOXIC, RiskLevel.LETHAL);
        assertThat(content.emergencyGuides())
                .allSatisfy(guide -> assertThat(guide.steps()).isNotBlank());
    }

    @Test
    void content_hasAnsweredAndPendingFaqs() {
        assertThat(content.faqs()).allSatisfy(faq -> assertThat(faq.question()).isNotBlank());
        assertThat(content.faqs()).anyMatch(faq -> faq.answer() != null);
        assertThat(content.faqs()).anyMatch(faq -> faq.answer() == null);
    }

    @Test
    void content_pendingEvaluationsReferenceCatalogFoodsAndAreSourced() throws Exception {
        DemoFoodSeeder foodSeeder = new DemoFoodSeeder(foodRepository, foodSafetyRepository, objectMapper);
        Set<String> catalogFoods = foodSeeder.loadCatalog().foods().stream()
                .map(food -> food.name().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        assertThat(content.pendingEvaluations()).isNotEmpty().allSatisfy(entry -> {
            assertThat(catalogFoods).as("food not in catalog: %s", entry.food())
                    .contains(entry.food().toLowerCase(Locale.ROOT));
            assertThat(entry.species()).isNotNull();
            assertThat(entry.riskLevel()).isNotNull();
            assertThat(entry.sources()).as(entry.food()).isNotEmpty();
        });
    }

    @Test
    @SuppressWarnings("unchecked")
    void run_onEmptyDatabase_createsGuidesFaqsAndPendingEvaluations() throws Exception {
        when(emergencyGuideRepository.findByRiskLevel(any())).thenReturn(Optional.empty());
        when(faqRepository.count()).thenReturn(0L);
        when(foodRepository.findByNameIgnoreCase(anyString()))
                .thenAnswer(invocation -> Optional.of(Food.builder().id(1L).name(invocation.getArgument(0)).build()));
        when(foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(anyLong(), any())).thenReturn(Optional.empty());

        seeder.run();

        verify(emergencyGuideRepository, times(content.emergencyGuides().size())).save(any(EmergencyGuide.class));

        ArgumentCaptor<List<Faq>> faqs = ArgumentCaptor.forClass(List.class);
        verify(faqRepository).saveAll(faqs.capture());
        assertThat(faqs.getValue()).hasSize(content.faqs().size()).allSatisfy(faq -> {
            assertThat(faq.getAskedBy()).isEqualTo(DemoContentSeeder.DEMO_OWNER_ID);
            if (faq.getAnswer() == null) {
                assertThat(faq.getStatus()).isEqualTo(FaqStatus.PENDING);
                assertThat(faq.getAnsweredBy()).isNull();
            } else {
                assertThat(faq.getStatus()).isEqualTo(FaqStatus.ANSWERED);
                assertThat(faq.getAnsweredBy()).isEqualTo(DemoContentSeeder.DEMO_VETERINARIAN_ID);
                assertThat(faq.getAnsweredAt()).isNotNull();
            }
        });

        ArgumentCaptor<FoodSafety> evaluations = ArgumentCaptor.forClass(FoodSafety.class);
        verify(foodSafetyRepository, times(content.pendingEvaluations().size())).save(evaluations.capture());
        assertThat(evaluations.getAllValues()).allSatisfy(evaluation -> {
            assertThat(evaluation.getVerifiedStatus()).isEqualTo(VerifiedStatus.PENDING);
            assertThat(evaluation.getVerifiedBy()).isNull();
            assertThat(evaluation.getSources()).isNotEmpty()
                    .allSatisfy(source -> assertThat(source.getFoodSafety()).isSameAs(evaluation));
        });
    }

    @Test
    void run_whenContentAlreadyExists_createsNothing() throws Exception {
        when(emergencyGuideRepository.findByRiskLevel(any())).thenReturn(Optional.of(new EmergencyGuide()));
        when(faqRepository.count()).thenReturn(3L);
        when(foodRepository.findByNameIgnoreCase(anyString()))
                .thenReturn(Optional.of(Food.builder().id(1L).build()));
        when(foodSafetyRepository.findByFoodIdAndSpeciesAndLifeStageIsNull(anyLong(), any()))
                .thenReturn(Optional.of(new FoodSafety()));

        seeder.run();

        verify(emergencyGuideRepository, never()).save(any());
        verify(faqRepository, never()).saveAll(anyList());
        verify(foodSafetyRepository, never()).save(any());
    }

    @Test
    void run_whenFoodIsMissing_skipsItsPendingEvaluation() throws Exception {
        when(emergencyGuideRepository.findByRiskLevel(any())).thenReturn(Optional.of(new EmergencyGuide()));
        when(faqRepository.count()).thenReturn(3L);
        when(foodRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.empty());

        seeder.run();

        verify(foodSafetyRepository, never()).save(any());
    }
}