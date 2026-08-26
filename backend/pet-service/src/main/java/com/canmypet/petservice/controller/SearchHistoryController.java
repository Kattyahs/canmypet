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

import java.util.List;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    @GetMapping("/me")
    public ResponseEntity<List<SearchHistoryResponse>> getMyHistory(
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        return ResponseEntity.ok(searchHistoryService.getHistoryForUser(principal.userId()));
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