package com.canmypet.petservice.service;

import com.canmypet.petservice.dto.SearchHistoryRequest;
import com.canmypet.petservice.dto.SearchHistoryResponse;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.PetNotFoundException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.SearchHistory;
import com.canmypet.petservice.repository.PetRepository;
import com.canmypet.petservice.repository.SearchHistoryRepository;
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
import com.canmypet.petservice.dto.PageResponse;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


@ExtendWith(MockitoExtension.class)
class SearchHistoryServiceTest {

    @Mock
    private SearchHistoryRepository searchHistoryRepository;

    @Mock
    private PetRepository petRepository;

    @InjectMocks
    private SearchHistoryService searchHistoryService;

    @Test
    void getHistoryForUser_returnsMappedPage() {
        Long userId = 1L;
        Pet pet = Pet.builder().id(10L).name("Firulais").ownerId(userId).build();

        SearchHistory entry = SearchHistory.builder()
                .id(1L)
                .userId(userId)
                .pet(pet)
                .foodId(5L)
                .build();

        Pageable pageable = PageRequest.of(0, 20);
        when(searchHistoryRepository.findByUserId(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(entry), pageable, 1));

        PageResponse<SearchHistoryResponse> result =
                searchHistoryService.getHistoryForUser(userId, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).getFoodId()).isEqualTo(5L);
        assertThat(result.content().get(0).getPetId()).isEqualTo(10L);
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void recordSearch_withoutPetId_savesSuccessfully() {
        Long userId = 1L;
        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setFoodId(5L);

        SearchHistory saved = SearchHistory.builder()
                .id(1L)
                .userId(userId)
                .foodId(5L)
                .build();

        when(searchHistoryRepository.save(any(SearchHistory.class))).thenReturn(saved);

        SearchHistoryResponse response = searchHistoryService.recordSearch(request, userId);

        assertThat(response.getFoodId()).isEqualTo(5L);
        verify(petRepository, never()).findById(any());
    }

    @Test
    void recordSearch_withOwnPet_savesSuccessfully() {
        Long userId = 1L;
        Long petId = 10L;

        Pet pet = Pet.builder().id(petId).name("Firulais").ownerId(userId).build();

        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setPetId(petId);
        request.setFoodId(5L);

        when(petRepository.findById(petId)).thenReturn(Optional.of(pet));

        SearchHistory saved = SearchHistory.builder()
                .id(1L)
                .userId(userId)
                .pet(pet)
                .foodId(5L)
                .build();

        when(searchHistoryRepository.save(any(SearchHistory.class))).thenReturn(saved);

        SearchHistoryResponse response = searchHistoryService.recordSearch(request, userId);

        assertThat(response.getPetId()).isEqualTo(petId);
    }

    @Test
    void recordSearch_withAnotherUsersPet_throwsForbiddenPetAccessException() {
        Long userId = 1L;
        Long attackerId = 2L;
        Long petId = 10L;

        Pet pet = Pet.builder().id(petId).name("Firulais").ownerId(userId).build();

        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setPetId(petId);
        request.setFoodId(5L);

        when(petRepository.findById(petId)).thenReturn(Optional.of(pet));

        assertThatThrownBy(() -> searchHistoryService.recordSearch(request, attackerId))
                .isInstanceOf(ForbiddenPetAccessException.class);

        verify(searchHistoryRepository, never()).save(any(SearchHistory.class));
    }

    @Test
    void recordSearch_withNonExistentPet_throwsPetNotFoundException() {
        Long userId = 1L;
        Long petId = 999L;

        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setPetId(petId);
        request.setFoodId(5L);

        when(petRepository.findById(petId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> searchHistoryService.recordSearch(request, userId))
                .isInstanceOf(PetNotFoundException.class);
    }
}