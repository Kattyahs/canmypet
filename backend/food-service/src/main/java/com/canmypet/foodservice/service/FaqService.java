package com.canmypet.foodservice.service;

import com.canmypet.foodservice.client.UserServiceClient;
import com.canmypet.foodservice.dto.FaqAnswerRequest;
import com.canmypet.foodservice.dto.FaqRequest;
import com.canmypet.foodservice.dto.FaqResponse;
import com.canmypet.foodservice.dto.UserDto;
import com.canmypet.foodservice.exception.FaqNotFoundException;
import com.canmypet.foodservice.exception.UnauthorizedAnswerException;
import com.canmypet.foodservice.model.Faq;
import com.canmypet.foodservice.model.FaqStatus;
import com.canmypet.foodservice.repository.FaqRepository;
import com.canmypet.foodservice.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;
    private final UserServiceClient userServiceClient;

    public PageResponse<FaqResponse> getFaqs(FaqStatus status, Pageable pageable) {
        var page = (status == null)
                ? faqRepository.findAll(pageable)
                : faqRepository.findByStatus(status, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public FaqResponse askQuestion(FaqRequest request, Long userId) {
        Faq faq = Faq.builder()
                .question(request.getQuestion())
                .askedBy(userId)
                .status(FaqStatus.PENDING)
                .build();

        Faq saved = faqRepository.save(faq);
        return toResponse(saved);
    }

    public FaqResponse answerQuestion(Long id, FaqAnswerRequest request, Long answererId) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new FaqNotFoundException(id));

        UserDto answerer;
        try {
            answerer = userServiceClient.getUserById(answererId);
        } catch (FeignException e) {
            throw new UnauthorizedAnswerException("Could not validate answerer with user-service");
        }

        if (!"VETERINARIAN".equals(answerer.getRole()) || !Boolean.TRUE.equals(answerer.getVerified())) {
            throw new UnauthorizedAnswerException("Only verified veterinarians can answer FAQ questions");
        }

        faq.setAnswer(request.getAnswer());
        faq.setAnsweredBy(answererId);
        faq.setStatus(FaqStatus.ANSWERED);
        faq.setAnsweredAt(LocalDateTime.now());

        Faq updated = faqRepository.save(faq);
        return toResponse(updated);
    }

    private FaqResponse toResponse(Faq faq) {
        return FaqResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .askedBy(faq.getAskedBy())
                .answeredBy(faq.getAnsweredBy())
                .status(faq.getStatus())
                .createdAt(faq.getCreatedAt())
                .answeredAt(faq.getAnsweredAt())
                .build();
    }
}