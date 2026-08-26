package com.canmypet.petservice.service;

import com.canmypet.petservice.dto.SearchHistoryRequest;
import com.canmypet.petservice.dto.SearchHistoryResponse;
import com.canmypet.petservice.exception.ForbiddenPetAccessException;
import com.canmypet.petservice.exception.PetNotFoundException;
import com.canmypet.petservice.model.Pet;
import com.canmypet.petservice.model.SearchHistory;
import com.canmypet.petservice.repository.PetRepository;
import com.canmypet.petservice.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final PetRepository petRepository;

    public List<SearchHistoryResponse> getHistoryForUser(Long userId) {
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public SearchHistoryResponse recordSearch(SearchHistoryRequest request, Long userId) {
        Pet pet = null;

        if (request.getPetId() != null) {
            pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new PetNotFoundException(request.getPetId()));

            if (!pet.getOwnerId().equals(userId)) {
                throw new ForbiddenPetAccessException();
            }
        }

        SearchHistory entry = SearchHistory.builder()
                .userId(userId)
                .pet(pet)
                .foodId(request.getFoodId())
                .build();

        SearchHistory saved = searchHistoryRepository.save(entry);
        return toResponse(saved);
    }

    private SearchHistoryResponse toResponse(SearchHistory entry) {
        return SearchHistoryResponse.builder()
                .id(entry.getId())
                .userId(entry.getUserId())
                .petId(entry.getPet() != null ? entry.getPet().getId() : null)
                .foodId(entry.getFoodId())
                .searchedAt(entry.getSearchedAt())
                .build();
    }
}