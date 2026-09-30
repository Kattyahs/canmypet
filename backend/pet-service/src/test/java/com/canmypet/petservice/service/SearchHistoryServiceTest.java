package com.canmypet.petservice.service;

import com.canmypet.petservice.dto.PageResponse;
import com.canmypet.petservice.dto.SearchHistoryRequest;
import com.canmypet.petservice.dto.SearchHistoryResponse;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.PetNotFoundException;
import com.canmypet.petservice.model.LifeStage;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.SearchHistory;
import com.canmypet.petservice.model.Species;
import com.canmypet.petservice.repository.PetRepository;
import com.canmypet.petservice.repository.SearchHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
                .species(Species.DOG)
                .lifeStage(LifeStage.ADULT)
                .build();

        Pageable pageable = PageRequest.of(0, 20);
        when(searchHistoryRepository.findByUserId(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(entry), pageable, 1));

        PageResponse<SearchHistoryResponse> result =
                searchHistoryService.getHistoryForUser(userId, null, pageable);

        assertThat(result.content()).hasSize(1);
        SearchHistoryResponse response = result.content().get(0);
        assertThat(response.getFoodId()).isEqualTo(5L);
        assertThat(response.getPetId()).isEqualTo(10L);
        assertThat(response.getSpecies()).isEqualTo(Species.DOG);
        assertThat(response.getLifeStage()).isEqualTo(LifeStage.ADULT);
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void getHistoryForUser_withPetId_filtersByThatPetInTheDatabase() {
        Long userId = 1L;
        Pet pet = Pet.builder().id(10L).name("Michi").ownerId(userId).build();
        SearchHistory entry = SearchHistory.builder().id(2L).userId(userId).pet(pet).foodId(7L).build();

        Pageable pageable = PageRequest.of(0, 20);
        when(searchHistoryRepository.findByUserIdAndPet_Id(userId, 10L, pageable))
                .thenReturn(new PageImpl<>(List.of(entry), pageable, 1));

        PageResponse<SearchHistoryResponse> result =
                searchHistoryService.getHistoryForUser(userId, 10L, pageable);

        assertThat(result.content()).extracting(SearchHistoryResponse::getPetId).containsExactly(10L);
        verify(searchHistoryRepository, never()).findByUserId(any(), any(Pageable.class));
    }

    @Test
    void getHistoryForUser_withAnotherUsersPetId_onlySearchesTheCallersHistory() {
        Pageable pageable = PageRequest.of(0, 20);
        when(searchHistoryRepository.findByUserIdAndPet_Id(2L, 10L, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        PageResponse<SearchHistoryResponse> result =
                searchHistoryService.getHistoryForUser(2L, 10L, pageable);

        assertThat(result.content()).isEmpty();
        verify(searchHistoryRepository).findByUserIdAndPet_Id(2L, 10L, pageable);
    }

    @Test
    void recordSearch_withoutPetId_savesSuccessfully() {
        Long userId = 1L;
        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setFoodId(5L);

        when(searchHistoryRepository.save(any(SearchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SearchHistoryResponse response = searchHistoryService.recordSearch(request, userId);

        assertThat(response.getFoodId()).isEqualTo(5L);
        assertThat(response.getSpecies()).isNull();
        assertThat(response.getLifeStage()).isNull();
        verify(petRepository, never()).findById(any());
    }

    @Test
    void recordSearch_withoutPetId_keepsRequestedSpeciesAndLifeStage() {
        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setFoodId(5L);
        request.setSpecies(Species.CAT);
        request.setLifeStage(LifeStage.SENIOR);

        when(searchHistoryRepository.save(any(SearchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        searchHistoryService.recordSearch(request, 1L);

        ArgumentCaptor<SearchHistory> saved = ArgumentCaptor.forClass(SearchHistory.class);
        verify(searchHistoryRepository).save(saved.capture());
        assertThat(saved.getValue().getPet()).isNull();
        assertThat(saved.getValue().getSpecies()).isEqualTo(Species.CAT);
        assertThat(saved.getValue().getLifeStage()).isEqualTo(LifeStage.SENIOR);
    }

    @Test
    void recordSearch_withOwnPet_savesSuccessfully() {
        Long userId = 1L;
        Long petId = 10L;

        Pet pet = Pet.builder().id(petId).name("Firulais").species(Species.DOG).ownerId(userId).build();

        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setPetId(petId);
        request.setFoodId(5L);

        when(petRepository.findById(petId)).thenReturn(Optional.of(pet));
        when(searchHistoryRepository.save(any(SearchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SearchHistoryResponse response = searchHistoryService.recordSearch(request, userId);

        assertThat(response.getPetId()).isEqualTo(petId);
    }

    @Test
    void recordSearch_withOwnPet_copiesSpeciesAndLifeStageFromThePet() {
        Long userId = 1L;
        Pet pet = Pet.builder().id(10L).name("Michi").species(Species.CAT).lifeStage(LifeStage.SENIOR)
                .ownerId(userId).build();

        SearchHistoryRequest request = new SearchHistoryRequest();
        request.setPetId(10L);
        request.setFoodId(5L);
        request.setSpecies(Species.DOG);
        request.setLifeStage(LifeStage.PUPPY);

        when(petRepository.findById(10L)).thenReturn(Optional.of(pet));
        when(searchHistoryRepository.save(any(SearchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SearchHistoryResponse response = searchHistoryService.recordSearch(request, userId);

        assertThat(response.getSpecies()).isEqualTo(Species.CAT);
        assertThat(response.getLifeStage()).isEqualTo(LifeStage.SENIOR);
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