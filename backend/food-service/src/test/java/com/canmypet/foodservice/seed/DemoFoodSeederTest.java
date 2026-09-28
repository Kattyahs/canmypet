package com.canmypet.foodservice.seed;

import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import com.canmypet.foodservice.seed.DemoFoodCatalog;
import com.canmypet.foodservice.seed.DemoFoodSeeder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.AbstractMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoFoodSeederTest {

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private FoodSafetyRepository foodSafetyRepository;

    private DemoFoodSeeder seeder;
    private DemoFoodCatalog catalog;

    @BeforeEach
    void setUp() throws Exception {
        seeder = new DemoFoodSeeder(foodRepository, foodSafetyRepository, new ObjectMapper());
        catalog = seeder.loadCatalog();
    }

    @Test
    void catalog_hasUniqueFoodNames() {
        Set<String> names = new HashSet<>();

        catalog.foods().forEach(food ->
                assertThat(names.add(food.name().toLowerCase(Locale.ROOT)))
                        .as("duplicated food name: %s", food.name())
                        .isTrue());

        assertThat(names).isNotEmpty();
    }

    @Test
    void catalog_everyEvaluationIsCompleteAndSourced() {
        catalog.foods().forEach(food -> {
            assertThat(food.category()).as(food.name()).isNotBlank();
            assertThat(food.evaluations()).as(food.name()).isNotEmpty();

            Set<Map.Entry<Species, LifeStage>> keys = new HashSet<>();
            food.evaluations().forEach(evaluation -> {
                assertThat(keys.add(new AbstractMap.SimpleEntry<>(evaluation.species(), evaluation.lifeStage())))
                        .as("duplicated species and life stage in %s", food.name())
                        .isTrue();
                assertThat(evaluation.species()).as(food.name()).isNotNull();
                assertThat(evaluation.riskLevel()).as(food.name()).isNotNull();
                assertThat(evaluation.notes()).as(food.name()).isNotBlank();
                assertThat(evaluation.sources()).as(food.name()).isNotEmpty();
                evaluation.sources().forEach(source -> {
                    assertThat(source.name()).as(food.name()).isNotBlank();
                    assertThat(source.url()).as(food.name()).startsWith("https://").hasSizeLessThanOrEqualTo(255);
                });
            });
        });
    }

    @Test
    void run_withEmptyCatalog_createsEveryFoodWithVerifiedEvaluations() throws Exception {
        when(foodRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(foodRepository.save(any(Food.class))).thenAnswer(invocation -> invocation.getArgument(0));

        seeder.run();

        int expectedEvaluations = catalog.foods().stream().mapToInt(food -> food.evaluations().size()).sum();
        ArgumentCaptor<FoodSafety> captor = ArgumentCaptor.forClass(FoodSafety.class);
        verify(foodRepository, times(catalog.foods().size())).save(any(Food.class));
        verify(foodSafetyRepository, times(expectedEvaluations)).save(captor.capture());

        captor.getAllValues().forEach(entry -> {
            assertThat(entry.getVerifiedStatus()).isEqualTo(VerifiedStatus.VERIFIED);
            assertThat(entry.getVerifiedBy()).isEqualTo(DemoFoodSeeder.DEMO_VETERINARIAN_ID);
            assertThat(entry.getFood()).isNotNull();
            assertThat(entry.getSources()).isNotEmpty();
            assertThat(entry.getSources()).allSatisfy(source -> assertThat(source.getFoodSafety()).isSameAs(entry));
        });
    }

    @Test
    void run_skipsFoodsThatAlreadyExist() throws Exception {
        when(foodRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(foodRepository.existsByNameIgnoreCase("Chocolate")).thenReturn(true);
        when(foodRepository.save(any(Food.class))).thenAnswer(invocation -> invocation.getArgument(0));

        seeder.run();

        ArgumentCaptor<Food> captor = ArgumentCaptor.forClass(Food.class);
        verify(foodRepository, times(catalog.foods().size() - 1)).save(captor.capture());
        assertThat(captor.getAllValues()).extracting(Food::getName).doesNotContain("Chocolate");
    }

    @Test
    void run_whenEveryFoodExists_savesNothing() throws Exception {
        when(foodRepository.existsByNameIgnoreCase(anyString())).thenReturn(true);

        seeder.run();

        verify(foodRepository, never()).save(any(Food.class));
        verify(foodSafetyRepository, never()).save(any(FoodSafety.class));
    }

    @Test
    void catalog_containsExpectedReferenceFoods() {
        List<String> names = catalog.foods().stream().map(DemoFoodCatalog.FoodEntry::name).toList();

        assertThat(names).contains("Chocolate", "Uvas", "Xilitol", "Zanahoria");
    }
}
