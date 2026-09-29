package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.publicapi.PublicEvaluation;
import com.canmypet.foodservice.dto.publicapi.PublicFoodResult;
import com.canmypet.foodservice.dto.publicapi.PublicFoodSafetySearchResponse;
import com.canmypet.foodservice.dto.publicapi.PublicSource;
import com.canmypet.foodservice.exception.InvalidPublicParameterException;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.model.FoodSafety;
import com.canmypet.foodservice.model.LifeStage;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.model.Source;
import com.canmypet.foodservice.model.Species;
import com.canmypet.foodservice.model.VerifiedStatus;
import com.canmypet.foodservice.repository.FoodRepository;
import com.canmypet.foodservice.repository.FoodSafetyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicFoodServiceTest {

    private static final Pageable TOP_10_BY_NAME = PageRequest.of(0, 10, Sort.by("name"));

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private FoodSafetyRepository foodSafetyRepository;

    @InjectMocks
    private PublicFoodService publicFoodService;

    private final Food grape = Food.builder().id(7L).name("Uva").category("fruit").build();
    private final Food raisin = Food.builder().id(15L).name("Uva pasa").category("fruit").build();

    @Test
    void searchWithSafety_queryTooShort_throwsInvalidPublicParameterException() {
        assertThatThrownBy(() -> publicFoodService.searchWithSafety(" u ", Species.DOG, null))
                .isInstanceOf(InvalidPublicParameterException.class);

        verifyNoInteractions(foodRepository, foodSafetyRepository);
    }

    @Test
    void searchWithSafety_queryTooLong_throwsInvalidPublicParameterException() {
        assertThatThrownBy(() -> publicFoodService.searchWithSafety("a".repeat(101), Species.DOG, null))
                .isInstanceOf(InvalidPublicParameterException.class);

        verifyNoInteractions(foodRepository, foodSafetyRepository);
    }

    @Test
    void searchWithSafety_noMatchingFoods_returnsEmptyResults() {
        when(foodRepository.searchByName("xyz", TOP_10_BY_NAME)).thenReturn(List.of());

        PublicFoodSafetySearchResponse response = publicFoodService.searchWithSafety("xyz", Species.DOG, null);

        assertThat(response.results()).isEmpty();
        verifyNoInteractions(foodSafetyRepository);
    }

    @Test
    void searchWithSafety_trimsQueryAndReturnsNullEvaluationForFoodWithoutEntry() {
        when(foodRepository.searchByName("uva", TOP_10_BY_NAME)).thenReturn(List.of(grape, raisin));
        when(foodSafetyRepository.findByFoodIdInAndSpeciesAndVerifiedStatus(List.of(7L, 15L), Species.DOG, VerifiedStatus.VERIFIED))
                .thenReturn(List.of(entry(grape, null, RiskLevel.TOXIC)));

        PublicFoodSafetySearchResponse response = publicFoodService.searchWithSafety("  uva  ", Species.DOG, null);

        assertThat(response.results()).extracting(PublicFoodResult::foodName).containsExactly("Uva", "Uva pasa");
        assertThat(response.results().get(0).evaluation().riskLevel()).isEqualTo(RiskLevel.TOXIC);
        assertThat(response.results().get(1).evaluation()).isNull();
    }

    @Test
    void searchWithSafety_withLifeStage_prefersSpecificEntry() {
        stubGrapeEntries(entry(grape, null, RiskLevel.MODERATE), entry(grape, LifeStage.PUPPY, RiskLevel.TOXIC));

        PublicEvaluation evaluation = publicFoodService.searchWithSafety("uva", Species.DOG, LifeStage.PUPPY)
                .results().get(0).evaluation();

        assertThat(evaluation.lifeStage()).isEqualTo(LifeStage.PUPPY);
        assertThat(evaluation.riskLevel()).isEqualTo(RiskLevel.TOXIC);
    }

    @Test
    void searchWithSafety_withLifeStageWithoutSpecificEntry_fallsBackToGeneralEntry() {
        stubGrapeEntries(entry(grape, null, RiskLevel.TOXIC));

        PublicEvaluation evaluation = publicFoodService.searchWithSafety("uva", Species.DOG, LifeStage.ADULT)
                .results().get(0).evaluation();

        assertThat(evaluation.lifeStage()).isNull();
        assertThat(evaluation.riskLevel()).isEqualTo(RiskLevel.TOXIC);
    }

    @Test
    void searchWithSafety_withoutLifeStageAndOnlySpecificEntries_returnsNullEvaluation() {
        stubGrapeEntries(entry(grape, LifeStage.PUPPY, RiskLevel.TOXIC));

        PublicEvaluation evaluation = publicFoodService.searchWithSafety("uva", Species.DOG, null)
                .results().get(0).evaluation();

        assertThat(evaluation).isNull();
    }

    @Test
    void searchWithSafety_mapsSources() {
        FoodSafety general = entry(grape, null, RiskLevel.TOXIC);
        general.getSources().add(Source.builder()
                .foodSafety(general)
                .sourceName("ASPCA")
                .sourceUrl("https://www.aspca.org")
                .build());
        stubGrapeEntries(general);

        List<PublicSource> sources = publicFoodService.searchWithSafety("uva", Species.DOG, null)
                .results().get(0).evaluation().sources();

        assertThat(sources).containsExactly(new PublicSource("ASPCA", "https://www.aspca.org"));
    }

    private void stubGrapeEntries(FoodSafety... entries) {
        when(foodRepository.searchByName("uva", TOP_10_BY_NAME)).thenReturn(List.of(grape));
        when(foodSafetyRepository.findByFoodIdInAndSpeciesAndVerifiedStatus(List.of(7L), Species.DOG, VerifiedStatus.VERIFIED))
                .thenReturn(List.of(entries));
    }

    private FoodSafety entry(Food food, LifeStage lifeStage, RiskLevel riskLevel) {
        return FoodSafety.builder()
                .food(food)
                .species(Species.DOG)
                .lifeStage(lifeStage)
                .riskLevel(riskLevel)
                .verifiedStatus(VerifiedStatus.VERIFIED)
                .build();
    }
}