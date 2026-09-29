package com.canmypet.petservice.dto;

import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Species;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SearchHistoryRequestTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void lifeStageWithoutSpecies_isRejected() {
        Set<ConstraintViolation<SearchHistoryRequest>> violations = validator.validate(request(null, LifeStage.ADULT));

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .containsExactly("lifeStageWithSpecies");
    }

    @Test
    void speciesWithLifeStage_isValid() {
        assertThat(validator.validate(request(Species.DOG, LifeStage.PUPPY))).isEmpty();
    }

    @Test
    void speciesWithoutLifeStage_isValid() {
        assertThat(validator.validate(request(Species.CAT, null))).isEmpty();
    }

    @Test
    void neitherSpeciesNorLifeStage_isValid() {
        assertThat(validator.validate(request(null, null))).isEmpty();
    }

    private SearchHistoryRequest request(Species species, LifeStage lifeStage) {
        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setFoodId(5L);
        request.setSpecies(species);
        request.setLifeStage(lifeStage);
        return request;
    }
}