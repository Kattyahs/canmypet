package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.FoodRequest;
import com.canmypet.foodservice.dto.FoodResponse;
import com.canmypet.foodservice.exception.FoodNotFoundException;
import com.canmypet.foodservice.model.Food;
import com.canmypet.foodservice.repository.FoodRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodService foodService;

    @Test
    void getAllFoods_returnsAllFoods() {
        Food chocolate = Food.builder().id(1L).name("Chocolate").category("human food").build();

        when(foodRepository.findAll()).thenReturn(List.of(chocolate));

        List<FoodResponse> result = foodService.getAllFoods();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Chocolate");
    }

    @Test
    void getFoodById_existingId_returnsFood() {
        Food chocolate = Food.builder().id(1L).name("Chocolate").category("human food").build();

        when(foodRepository.findById(1L)).thenReturn(Optional.of(chocolate));

        FoodResponse result = foodService.getFoodById(1L);

        assertThat(result.getName()).isEqualTo("Chocolate");
    }

    @Test
    void getFoodById_nonExistentId_throwsFoodNotFoundException() {
        when(foodRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> foodService.getFoodById(999L))
                .isInstanceOf(FoodNotFoundException.class);
    }

    @Test
    void searchFoods_returnsMatchingResults() {
        Food chocolate = Food.builder().id(1L).name("Chocolate negro").category("human food").build();

        when(foodRepository.findByNameContainingIgnoreCase("choco")).thenReturn(List.of(chocolate));

        List<FoodResponse> result = foodService.searchFoods("choco");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Chocolate negro");
    }

    @Test
    void createFood_savesAndReturnsFood() {
        FoodRequest request = new FoodRequest();
        request.setName("Uvas");
        request.setCategory("fruit");
        request.setDescription("Toxic for dogs");

        Food saved = Food.builder().id(2L).name("Uvas").category("fruit").description("Toxic for dogs").build();

        when(foodRepository.save(any(Food.class))).thenReturn(saved);

        FoodResponse response = foodService.createFood(request);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getName()).isEqualTo("Uvas");
    }
}