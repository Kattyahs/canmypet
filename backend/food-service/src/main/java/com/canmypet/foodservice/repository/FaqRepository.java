package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.Faq;
import com.canmypet.foodservice.model.FaqStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    Page<Faq> findByStatus(FaqStatus status, Pageable pageable);
}