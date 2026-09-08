package com.canmypet.foodservice.repository;

import com.canmypet.foodservice.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findAllByOrderByCreatedAtDesc();
}