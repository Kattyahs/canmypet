package com.canmypet.petservice.controller;

import com.canmypet.petservice.dto.SearchHistoryRequest;
import com.canmypet.petservice.dto.SearchHistoryResponse;
import com.canmypet.petservice.security.JwtPrincipal;
import com.canmypet.petservice.service.SearchHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.canmypet.petservice.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    @GetMapping("/me")
    public ResponseEntity<PageResponse<SearchHistoryResponse>> getMyHistory(
            @AuthenticationPrincipal JwtPrincipal principal,
            @PageableDefault(size = 20, sort = "searchedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(searchHistoryService.getHistoryForUser(principal.userId(), pageable));
    }

    @PostMapping
    public ResponseEntity<SearchHistoryResponse> recordSearch(
            @Valid @RequestBody SearchHistoryRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        SearchHistoryResponse response = searchHistoryService.recordSearch(request, principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}