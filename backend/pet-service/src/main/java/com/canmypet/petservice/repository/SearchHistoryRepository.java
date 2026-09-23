package com.canmypet.petservice.repository;

import com.canmypet.petservice.model.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    @EntityGraph(attributePaths = {"pet"})
    Page<SearchHistory> findByUserId(Long userId, Pageable pageable);
}